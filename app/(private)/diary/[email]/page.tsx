// import db from '@/supabase'
import { desc, eq } from 'drizzle-orm'
import { diary } from '@/supabase/schema'
import DiaryList from '@/components/diary/DiaryList'
import { getUser } from '@/actions/session/getUser'
import dayjs from 'dayjs'
import { dbCallback } from '@/supabase/getDbInstance'
import db from '@/supabase'
import getDiaryList from '@/actions/diary/getDiaryList'

export default async function Page() {
  try {
    let user: any = await getUser()
    if (!user) {
      return <div>로그인이 필요합니다.</div>
    }

    const diaryList = await getDiaryList()
    return <DiaryList list={diaryList} />
  } catch (error) {
    console.error('페이지 로딩 에러:', error)
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
  }
}
