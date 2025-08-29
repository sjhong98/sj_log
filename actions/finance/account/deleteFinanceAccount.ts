'use server'

import db from '@/supabase'
import { financeAccount, financeLog } from '@/supabase/schema'
import { and, eq } from 'drizzle-orm'
import { getUser } from '@/actions/session/getUser'

export default async function deleteFinanceAccount(accountPk: number) {
  const user = await getUser()
  if (!user) {
    throw new Error('사용자 인증이 필요합니다.')
  }

  try {
    // 먼저 해당 계좌가 사용자의 것인지 확인
    const [account] = await db
      .select()
      .from(financeAccount)
      .where(
        and(
          eq(financeAccount.pk, accountPk),
          eq(financeAccount.uid, user.id)
        )
      )

    if (!account) {
      throw new Error('계좌를 찾을 수 없거나 삭제 권한이 없습니다.')
    }

    // financeAccount 삭제
    const result = await db
      .delete(financeAccount)
      .where(
        and(
          eq(financeAccount.pk, accountPk),
          eq(financeAccount.uid, user.id)
        )
      )
      .returning()

    return result[0]
  } catch (error) {
    console.error('계좌 삭제 중 오류 발생:', error)
    throw error
  }
} 