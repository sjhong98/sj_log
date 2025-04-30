import { IconAdjustmentsAlt, IconCurrencyWon, IconX } from '@tabler/icons-react'
import { Dialog, DialogContent, Tooltip } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import Column from '@/components/flexBox/column'
import { HyperText } from '@/components/magicui/hyper-text'
import { convertToNumber, formatInputNumber } from '@/utils/math'
import Row from '@/components/flexBox/row'
import calibrateAccounts from '@/components/finance/calibrateAccounts'
import { toast } from 'react-toastify'
import cloneDeep from 'lodash/cloneDeep'

export default function CalibrateAccount({
  accounts,
  refresh
}: {
  accounts: FinanceAccountType[]
  refresh: any
}) {
  const [open, setOpen] = useState<boolean>(false)
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [calibratedAccounts, setCalibratedAccounts] = useState<
    FinanceAccountType[]
  >([])

  useEffect(() => {
    setCalibratedAccounts(cloneDeep(accounts))
  }, [accounts])

  const handleClickCalibrate = useCallback(async () => {
    setButtonDisabled(true)
    const rowCount = await calibrateAccounts({
      accounts: calibratedAccounts,
      prevAccounts: accounts
    })
    if (rowCount) {
      setOpen(false)
      refresh()
      setButtonDisabled(false)
    } else toast.error('Failed to calibrate')
  }, [calibratedAccounts])

  return (
    <>
      <Tooltip title={'Calibrate Account'}>
        <button
          className={
            'rounded-full bg-[#dadada] p-2 mb-[6px] cursor-pointer scale-0 scale-up-appear'
          }
          onClick={() => setOpen(true)}
        >
          <IconAdjustmentsAlt color={'#050505'} />
        </button>
      </Tooltip>

      <Dialog
        open={open}
        sx={{
          '& .MuiDialogContent-root': {
            backgroundColor: 'var(--color-sub-background)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent>
          <Column className={'max-h-[80vh] overflow-y-auto custom-scrollbar'}>
            {calibratedAccounts.map(
              (account: FinanceAccountType, i: number) => {
                return (
                  <Column
                    key={i}
                    className={' focus-within:text-green-500 text-[#222]'}
                  >
                    <HyperText
                      className={'text-sm text-right'}
                      animateOnHover={false}
                    >
                      {account.title}
                    </HyperText>
                    <Row
                      className={
                        'relative rounded-md border-[2px] border-[#222] px-4 py-2 group focus-within:border-green-500 duration-75 mt-[-8px]'
                      }
                    >
                      <input
                        name={'amount'}
                        placeholder={'0'}
                        className={
                          'w-full outline-none !text-2xl text-end font2'
                        }
                        value={formatInputNumber(account.amount ?? 0)}
                        onChange={e => {
                          const raw = e.target.value
                          const number = convertToNumber(raw)

                          let _calibratedAccount = [...calibratedAccounts]
                          _calibratedAccount[i].amount = number
                          setCalibratedAccounts(_calibratedAccount)
                        }}
                        autoComplete='off'
                      />
                      <IconCurrencyWon className={'mt-[4px]'} />
                    </Row>
                  </Column>
                )
              }
            )}
          </Column>
          <Row gap={1} className={'w-full justify-end'}>
            <button
              onClick={() => setOpen(false)}
              className={`cursor-pointer border-[2px] border-[#dadada] px-1 py-1 mt-2 rounded-md text-[#dadada] font-bold`}
            >
              <IconX />
            </button>
            <button
              disabled={buttonDisabled}
              onClick={handleClickCalibrate}
              className={`cursor-pointer border-[2px] border-green-500 px-2 py-1 mt-2 rounded-md text-green-500 font-bold ${buttonDisabled && 'opacity-50'}`}
            >
              CALIBRATE
            </button>
          </Row>
        </DialogContent>
      </Dialog>
    </>
  )
}
