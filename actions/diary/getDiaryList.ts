'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function getDiaryList() {
    const user = await getUser()
    if (!user) return
  
    const { data: diaryList, error } = await db
      .from('diary')
      .select('pk, title, date, thumbnail')
      .eq('uid', user.id)
      .order('date', { ascending: false })
  
    if (error) {
      console.error('Error fetching diary list:', error)
      throw error
    }

    return diaryList || []
  }
  