import db from '@/supabase'
import { desc, eq } from 'drizzle-orm'
import { diary } from '@/supabase/schema'
import DiaryList from '@/components/diary/DiaryList'
import { getUser } from '@/actions/session/getUser'
import dayjs from 'dayjs'
import { refreshSession } from '@/actions/session/refreshSession'
import { cookies } from 'next/headers'

export default async function Page() {
  let user: any = await getUser()
  if (!user) return

  let diaryList: any = await db
    .select({
      pk: diary.pk,
      title: diary.title,
      date: diary.date,
      thumbnail: diary.thumbnail
    })
    .from(diary)
    .where(eq(diary.uid, user.id))
    .orderBy(desc(diary.date))

  diaryList.forEach((_: any, i: number) => {
    if (i > 0) {
      diaryList[i].isNewYear = !dayjs(diaryList[i - 1].date).isSame(
        dayjs(diaryList[i].date),
        'year'
      )
      diaryList[i].isNewMonth = !dayjs(diaryList[i - 1].date).isSame(
        dayjs(diaryList[i].date),
        'month'
      )
    } else {
      diaryList[i].isNewYear = true
      diaryList[i].isNewMonth = true
    }
  })

  return <DiaryList list={diaryList} />
}
