import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useCallback, useImperativeHandle, useState } from 'react'
import FinanceLogType from '@/types/finance/FinanceLogType'
import { IconCurrencyWon, IconPencil } from '@tabler/icons-react'
import financeTypes from '@/types/finance/FinanceTypes'
import CustomRadio from '@/components/radio/CustomRadio'
import financeCategories from '@/types/finance/FinanceCategories'
import Row from '@/components/flexBox/row'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import Column from '@/components/flexBox/column'
import dayjs from 'dayjs'
import { convertToNumber, formatInputNumber } from '@/utils/math'
import { Button } from '@/components/ui/button'
import createFinanceLog from '@/actions/finance/log/createFinanceLog'
import { toast } from 'react-toastify'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import { useRouter } from 'next/navigation'

// const CreateFinanceLogDialog = forwardRef(function Page(props, ref) )

export default function CreateFinanceLogDialog({
  ref,
  accounts,
  refreshData,
  refreshAccountData
}: {
  ref: any
  accounts: FinanceAccountType[]
  refreshData: any
  refreshAccountData: any
}) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [open, setOpen] = useState<boolean>(false)
  const [pickerOpen, setPickerOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState<FinanceLogType>({
    type: '',
    amount: 0,
    category: '',
    note: '',
    paymentMethod: '',
    financeAccountPk: null,
    date: new Date()
  })

  const handleChange = (e: any) => {
    let _formData = { ...formData }

    // @ts-ignore
    _formData[e.target.name] = e.target.value
    setFormData(_formData)
  }

  const handleOpen = useCallback(() => {
    setOpen(prev => !prev)
  }, [])

  useImperativeHandle(ref, () => {
    return {
      handleOpen
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    const rowCount = await createFinanceLog(formData)
    if (rowCount) {
      setOpen(false)
      toast.success('Log created successfully!')
      refreshData()
      refreshAccountData()
    }
  }, [formData])

  return (
    <>
      <Box>
        <div
          onClick={handleOpen}
          className={
            'bg-[#bbb] rounded-full p-2 shadow-lg z-[10] cursor-pointer hover:scale-[1.1] duration-100'
          }
        >
          <IconPencil color={'#333'} />
        </div>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiPaper-root': {
            minWidth: '750px'
          },
          '& .MuiDialogContent-root': {
            width: '750px',
            backgroundColor: 'var(--color-sub-background)',
            height: 'fit-content',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent>
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 12, md: 8 }}
              className={'border-r-[2px] pr-4 w-[500px] border-[#222]'}
            >
              <Grid container>
                <Grid size={{ xs: 12, md: 12 }}>
                  <CustomRadio
                    name={'type'}
                    list={financeTypes}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <CustomRadio
                    name={'category'}
                    list={financeCategories}
                    onChange={handleChange}
                    onlyIcon
                    wrap
                    etc
                    onEtcChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 12 }} className={'pl-2 mt-2'}>
                  <Row
                    className={
                      'relative w-[97%] rounded-md border-[2px] border-[#222] px-4 py-2 focus-within:border-[#dadada] duration-75'
                    }
                  >
                    <input
                      name={'amount'}
                      placeholder={'0'}
                      className={'w-full outline-none !text-2xl text-end mr-1'}
                      value={formatInputNumber(formData.amount ?? 0)}
                      onChange={e => {
                        const raw = e.target.value
                        const number = convertToNumber(raw)
                        setFormData(prev => ({
                          ...prev,
                          amount: number
                        }))
                      }}
                      autoComplete='off'
                    />
                    <IconCurrencyWon className={'mt-[6px]'} />
                  </Row>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }} className={'pl-2 mt-2'}>
                  <Row fullWidth className={'relative justify-between mt-2'}>
                    <Column
                      className={'cursor-pointer z-[9999]'}
                      onClick={() => {
                        setPickerOpen(true)
                      }}
                    >
                      <Typography>
                        {dayjs(formData?.date).format('YYYY. M. D ddd')}
                      </Typography>
                    </Column>
                    {formData.amount !== 0 && formData.financeAccountPk && (
                      <Button
                        variant={'outline'}
                        className={'cursor-pointer'}
                        onClick={handleSubmit}
                      >
                        SUBMIT
                      </Button>
                    )}
                    <Column className={'absolute'}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                          <DatePicker
                            open={pickerOpen}
                            onChange={value =>
                              setFormData({
                                ...formData,
                                date: value?.toDate() ?? new Date()
                              })
                            }
                            onClose={() => setPickerOpen(false)}
                            className={'opacity-0 pointer-events-none'}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </Column>
                  </Row>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} className={'w-[200px]'}>
              <Column
                className={
                  'max-h-[350px] w-full overflow-y-scroll custom-scrollbar'
                }
              >
                <CustomRadio
                  direction={'vertical'}
                  name={'account'}
                  list={accounts.map(account => {
                    return {
                      title: account.title
                    }
                  })}
                  onChange={(e: any) => {
                    const selectedAccountPk = accounts.find(
                      account => account.title === e.target.value
                    )?.pk
                    if (!selectedAccountPk) return

                    setFormData({
                      ...formData,
                      financeAccountPk: selectedAccountPk
                    })
                  }}
                />
              </Column>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}
