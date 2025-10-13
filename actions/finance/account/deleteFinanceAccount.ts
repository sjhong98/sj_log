'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function deleteFinanceAccount(accountPk: number) {
  const user = await getUser()
  if (!user) {
    throw new Error('사용자 인증이 필요합니다.')
  }

  try {
    // 먼저 해당 계좌가 사용자의 것인지 확인
    const { data: account, error: accountError } = await db
      .from('finance_account')
      .select('*')
      .eq('pk', accountPk)
      .eq('uid', user.id)
      .single()

    if (accountError || !account) {
      throw new Error('계좌를 찾을 수 없거나 삭제 권한이 없습니다.')
    }

    // financeAccount 삭제
    const { data: result, error: deleteError } = await db
      .from('finance_account')
      .delete()
      .eq('pk', accountPk)
      .eq('uid', user.id)
      .select()
      .single()

    if (deleteError) {
      console.error('Error deleting finance account:', deleteError)
      throw deleteError
    }

    return result
  } catch (error) {
    console.error('계좌 삭제 중 오류 발생:', error)
    throw error
  }
} 