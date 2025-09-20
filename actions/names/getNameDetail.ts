'use server'

import db from '@/supabase'
import { name, nameTagRelation, nameTag } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq } from 'drizzle-orm'

export default async function getNameDetail(pk: number) {
  const user = await getUser()
  if (!user) return

  const [nameItem] = await db
    .select()
    .from(name)
    .where(and(eq(name.uid, user.id), eq(name.pk, pk)))
    .limit(1)

  // 태그 정보도 함께 가져오기
  const tags = await db
    .select({
      pk: nameTag.pk,
      name: nameTag.name,
      createdAt: nameTag.createdAt
    })
    .from(nameTagRelation)
    .innerJoin(nameTag, eq(nameTagRelation.tagPk, nameTag.pk))
    .where(and(
      eq(nameTagRelation.namePk, pk),
      eq(nameTag.uid, user.id)
    ))

  return {
    ...nameItem,
    tags
  }
}
