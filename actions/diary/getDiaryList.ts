import snakeToCamel from '@/utils/snakeToCamel'
import { getUser } from '../session/getUser'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'

export default async function getDiaryList() {
  const user = await getUser()
  if (!user) return

  const loginToken = (await cookies()).get('logToken')?.value
  if (!loginToken) return

  const params = new URLSearchParams()
  params.set('order', 'date.desc')

  const result = await fetch(`${process.env.SUPABASE_REST_URL}/diary?${params.toString()}`, {
    headers: {
      apikey: process.env.SUPABASE_KEY ?? '',
      Authorization: `Bearer ${loginToken ?? ''}`,
    },
    cache: 'force-cache',
    next: {
      tags: ['diary'],
    },
  })

  let diaryList = await result.json()
  diaryList = snakeToCamel(diaryList)

  diaryList.forEach((_: any, i: number) => {
    if (i > 0) {
      diaryList[i].isNewYear = !dayjs(diaryList[i - 1].date).isSame(dayjs(diaryList[i].date), 'year')
      diaryList[i].isNewMonth = !dayjs(diaryList[i - 1].date).isSame(dayjs(diaryList[i].date), 'month')
    } else {
      diaryList[i].isNewYear = true
      diaryList[i].isNewMonth = true
    }
  })

  return diaryList
}
