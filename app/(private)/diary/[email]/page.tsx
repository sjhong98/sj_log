import db from '@/supabase'
import { desc, eq } from 'drizzle-orm'
import { diary } from '@/supabase/schema'
import DiaryList from '@/components/diary/DiaryList'
import { getUser } from '@/actions/session/getUser'
import dayjs from 'dayjs'
import getDiaryList from '@/actions/diary/getDiaryList'

export default async function Page() {
  let user: any = await getUser()
  if (!user) return

  const diaryList: any = await getDiaryList() || []

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
