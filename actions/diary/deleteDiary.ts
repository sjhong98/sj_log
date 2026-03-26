'use server'

import DiaryType from '@/types/DiaryType'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/actions/session/getUser'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'

function extractImageSrcFromHtml(content: string) {
  let sources: string[] = []
  const regex = /<img[^>]+src="([^">]+)"/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content ?? '')) !== null) {
    sources.push(match[1])
  }
  return sources
}

function normalizeBucketObjectPathFromSrc(
  src: string,
  bucket: string,
  options?: { supabaseUrl?: string },
): string | null {
  const trimmed = (src ?? '').trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null

  const storagePrefix = '/storage/v1/object/'

  // URL 형태는 Supabase origin일 때만 허용
  try {
    const url = new URL(trimmed)
    const supabaseUrl = (options?.supabaseUrl ?? '').trim()
    const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : ''
    if (supabaseOrigin && url.origin !== supabaseOrigin) return null

    const pathname = url.pathname ?? ''
    const storageIndex = pathname.indexOf(storagePrefix)
    if (storageIndex === -1) return null

    const bucketMarker = `/${bucket}/`
    const bucketIndex = pathname.indexOf(bucketMarker, storageIndex + storagePrefix.length)
    if (bucketIndex !== -1) {
      const rawPath = pathname.slice(bucketIndex + bucketMarker.length)
      const decodedPath = decodeURIComponent(rawPath)
      const normalized = decodedPath.replace(/^\/+/, '')
      if (!normalized || normalized.includes('..')) return null
      return normalized
    }
  } catch {
    // ignore parse failures and try fallback rules below
  }

  // absolute path 형태 처리 (예: /storage/v1/object/public/sjlog/<path>)
  if (trimmed.startsWith('/')) {
    const pathname = trimmed.split('?')[0].split('#')[0]
    const storageIndex = pathname.indexOf(storagePrefix)
    if (storageIndex !== -1) {
      const bucketMarker = `/${bucket}/`
      const bucketIndex = pathname.indexOf(bucketMarker, storageIndex + storagePrefix.length)
      if (bucketIndex !== -1) {
        const rawPath = pathname.slice(bucketIndex + bucketMarker.length)
        const decodedPath = decodeURIComponent(rawPath)
        const normalized = decodedPath.replace(/^\/+/, '')
        if (!normalized || normalized.includes('..')) return null
        return normalized
      }
    }
  }

  // 이미 버킷 내부 path로 보이는 형태: "<path>" 또는 "sjlog/<path>"
  const withoutLeadingSlashes = trimmed.replace(/^\/+/, '')
  const withoutBucketPrefix = withoutLeadingSlashes.startsWith(`${bucket}/`)
    ? withoutLeadingSlashes.slice(bucket.length + 1)
    : withoutLeadingSlashes

  if (!withoutBucketPrefix || withoutBucketPrefix.includes('..')) return null
  if (withoutBucketPrefix.includes('://')) return null

  return withoutBucketPrefix
}

export default async function deleteDiary(diaryItem: DiaryType) {
  const user = await getUser()
  if (!user) throw new Error('로그인이 필요합니다.')
  if (!diaryItem.pk) throw new Error('삭제할 게시물 식별자(pk)가 없습니다.')

  const loginToken = (await cookies()).get('logToken')?.value
  if (!loginToken) throw new Error('인증 토큰(logToken)이 없습니다.')

  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
  const SUPABASE_REST_URL = (process.env.SUPABASE_REST_URL ?? '').trim()

  if (!SUPABASE_URL) throw new Error('환경변수 SUPABASE_URL이 비어있습니다.')
  if (!SUPABASE_KEY) throw new Error('환경변수 SUPABASE_KEY가 비어있습니다.')

  const resolvedRestUrl = SUPABASE_REST_URL || `${SUPABASE_URL}/rest/v1`

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${loginToken}`,
      },
    },
  })

  //   Delete Image
  const sources = extractImageSrcFromHtml(diaryItem.content ?? '')
  if (sources.length > 0) {
    const bucket = 'sjlog'
    const objectPaths = Array.from(
      new Set(
        sources
          .map((src) => normalizeBucketObjectPathFromSrc(src, bucket, { supabaseUrl: SUPABASE_URL }))
          .filter((p): p is string => Boolean(p)),
      ),
    )

    if (objectPaths.length > 0) {
      const deleteImageResult = await supabase.storage.from(bucket).remove(objectPaths)
      if (deleteImageResult.error)
        throw new Error(`이미지 삭제 중 에러 발생: ${deleteImageResult.error}`)
    }
  }

  const params = new URLSearchParams()
  params.set('pk', `eq.${diaryItem.pk}`)
  params.set('uid', `eq.${user.id}`)

  const result = await fetch(`${resolvedRestUrl}/diary?${params.toString()}`, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${loginToken}`,
      Prefer: 'count=exact',
    },
  })

  if (!result.ok) {
    const errorText = await result.text().catch(() => '')
    throw new Error(`게시물 삭제 중 에러 발생: ${result.status} ${errorText}`)
  }

  revalidateTag('diary')

  const contentRange = result.headers.get('content-range') ?? ''
  const totalPart = contentRange.split('/')[1]
  let deletedCount = totalPart ? Number(totalPart) : 0
  if (!Number.isFinite(deletedCount) || deletedCount < 0) deletedCount = 0

  // 일부 환경에서 content-range가 비어있을 수 있어, 가능한 경우 바디로도 보정
  if (deletedCount === 0) {
    const contentType = result.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const body = await result.json().catch(() => null)
      if (Array.isArray(body)) deletedCount = body.length
    }
  }

  return deletedCount
}
