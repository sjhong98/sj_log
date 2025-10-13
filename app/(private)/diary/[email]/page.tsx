// import db from '@/supabase'
import { desc, eq } from 'drizzle-orm'
import { diary } from '@/supabase/schema'
import DiaryList from '@/components/diary/DiaryList'
import { getUser } from '@/actions/session/getUser'
import dayjs from 'dayjs'
import { dbCallback } from '@/supabase/getDbInstance'

export default async function Page() {
  try {
    let user: any = await getUser()
    if (!user) {
      return <div>로그인이 필요합니다.</div>
    }

    // withDb 래퍼를 사용해서 자동으로 커넥션 관리
    const diaryList = await dbCallback(async (db) => {
      let list: any = await db
        .select({
          pk: diary.pk,
          title: diary.title,
          date: diary.date,
          thumbnail: diary.thumbnail
        })
        .from(diary)
        .where(eq(diary.uid, user.id))
        .orderBy(desc(diary.date))

      list.forEach((_: any, i: number) => {
        if (i > 0) {
          list[i].isNewYear = !dayjs(list[i - 1].date).isSame(
            dayjs(list[i].date),
            'year'
          )
          list[i].isNewMonth = !dayjs(list[i - 1].date).isSame(
            dayjs(list[i].date),
            'month'
          )
        } else {
          list[i].isNewYear = true
          list[i].isNewMonth = true
        }
      })

      return list
    })

    return <DiaryList list={diaryList} />
  } catch (error) {
    console.error('페이지 로딩 에러:', error)
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
  }
}
