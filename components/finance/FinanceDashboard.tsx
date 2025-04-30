'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { IconButton, SpeedDial, SpeedDialAction, Tooltip } from '@mui/material'
import { IconAdjustmentsAlt, IconPlus } from '@tabler/icons-react'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import AccountDisplay from '@/components/finance/AccountDisplay'
import MonthlyLogsDisplay from '@/components/finance/MonthlyLogsDisplay'
import CreateFinanceLogDialog from '@/components/finance/CreateFinanceLogDialog'
import CreateFinanceAccountDialog from '@/components/finance/CreateFinanceAccountDialog'
import Column from '@/components/flexBox/column'
import getAccounts from '@/actions/finance/account/getAccounts'
import Row from '@/components/flexBox/row'
import CalibrateAccount from '@/components/finance/CalibarateAccount'

export default function FinanceDashboard({
  initialData
}: {
  initialData: { accounts: FinanceAccountType[] }
}) {
  const monthlyLogsDisplayRef = useRef<any>(null)
  const createLogDialogRef = useRef<any>(null)
  const createAccountDialogRef = useRef<any>(null)

  const [accounts, setAccounts] = useState<FinanceAccountType[]>(
    initialData.accounts.map(account => {
      return {
        ...account,
        amount: 0
      }
    })
  )
  const [_accounts, _setAccounts] = useState<FinanceAccountType[]>(
    initialData.accounts
  )

  const handleRefreshLogsData = useCallback(async () => {
    if (!monthlyLogsDisplayRef.current) return

    monthlyLogsDisplayRef.current.refreshData()
  }, [])

  const handleRefreshAccountData = useCallback(async () => {
    const accounts = await getAccounts()
    if (!accounts) return

    setAccounts(accounts)
  }, [])

  const actions = [
    {
      icon: (
        <CreateFinanceLogDialog
          ref={createLogDialogRef}
          accounts={accounts}
          refreshData={handleRefreshLogsData}
          refreshAccountData={handleRefreshAccountData}
        />
      ),
      name: 'Add Log'
    },
    {
      icon: (
        <CreateFinanceAccountDialog
          ref={createAccountDialogRef}
          refreshData={handleRefreshAccountData}
        />
      ),
      name: 'Add Account'
    }
  ]

  useEffect(() => {
    for (let i in _accounts) {
      setTimeout(
        () => {
          let tempAccount = [...accounts]
          tempAccount[i].amount = _accounts[i].amount
          setAccounts(tempAccount)
        },
        100 * Number(i)
      )
    }
  }, [_accounts])

  return (
    <>
      <Column gap={2} fullWidth className={''}>
        <AccountDisplay accounts={accounts} />
        <MonthlyLogsDisplay ref={monthlyLogsDisplayRef} />
      </Column>
      <Row
        gap={2}
        className={'w-full justify-end items-end fixed bottom-4 right-4'}
      >
        <CalibrateAccount
          accounts={accounts}
          refresh={async () => {
            await handleRefreshLogsData()
            await handleRefreshAccountData()
          }}
        />
        <SpeedDial
          ariaLabel='Add'
          sx={{
            '& .MuiButtonBase-root': {
              backgroundColor: '#dadada !important'
            }
          }}
          icon={<IconPlus />}
        >
          {actions.map(action => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
            />
          ))}
        </SpeedDial>
      </Row>
    </>
  )
}
