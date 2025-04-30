import { Grid } from '@mui/material'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import NumberFlow from '@number-flow/react'
import { IconCurrencyWon } from '@tabler/icons-react'
import DashboardContainer from '@/components/layouts/DashboardContainer'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import { useMemo } from 'react'
import { HyperText } from '@/components/magicui/hyper-text'

export default function AccountDisplay({
  accounts
}: {
  accounts: FinanceAccountType[]
}) {
  return useMemo(() => {
    return (
      <Column fullWidth>
        <Grid container spacing={2}>
          <DashboardContainer xs={12} md={5} mh={200} title={'Long-Term'}>
            <Column fullWidth className={'overflow-hidden mt-[-30px]'}>
              {accounts
                .filter(account => account.term === 'long')
                .map((account, i) => {
                  return (
                    <Column
                      key={i}
                      fullWidth
                      className={
                        'justify-between items-end flex-wrap mb-[-12px]'
                      }
                    >
                      <HyperText
                        initial={''}
                        className={'text-sm text-green-500 mr-4'}
                      >
                        {account.title}
                      </HyperText>
                      <Row className={'text-3xl text-green-500 mt-[-12px]'}>
                        <p className={'mt-[12px] mr-1 font2 text-sm'}>+</p>
                        <NumberFlow
                          className={'font2'}
                          value={account.amount}
                          spinTiming={{
                            duration: 1500,
                            easing: 'cubic-bezier(.74,.23,.16,1.02)'
                          }}
                        />
                        <IconCurrencyWon
                          className={'text-green-500 mt-3 w-4 h-4'}
                        />
                      </Row>
                    </Column>
                  )
                })}
            </Column>
          </DashboardContainer>
          <DashboardContainer xs={12} md={7} mh={200} title={'short-term'}>
            <Column className={'overflow-hidden mt-[-30px]'}>
              {accounts
                .filter(account => account.term === 'short')
                .map((account, i) => {
                  return (
                    <Column
                      key={i}
                      fullWidth
                      gap={0}
                      className={
                        'justify-between items-end flex-wrap mb-[-10px]'
                      }
                    >
                      <HyperText className={'text-sm text-green-500 mr-4'}>
                        {account.title}
                      </HyperText>
                      <Row
                        className={'text-2xl font2 text-green-500 mt-[-12px]'}
                      >
                        <p className={'font2 text-sm mt-2 mr-1'}>+</p>
                        <NumberFlow
                          value={account.amount}
                          spinTiming={{
                            duration: 1000,
                            easing: 'cubic-bezier(.74,.23,.16,1.02)'
                          }}
                        />
                        <IconCurrencyWon
                          className={'text-green-500 mt-[6px] w-4 h-4'}
                        />
                      </Row>
                    </Column>
                  )
                })}
            </Column>
          </DashboardContainer>
        </Grid>
      </Column>
    )
  }, [accounts])
}
