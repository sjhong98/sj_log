import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useCallback, useImperativeHandle, useState } from 'react'
import {
  IconBolt,
  IconCurrencyWon,
  IconPig,
  IconTarget
} from '@tabler/icons-react'
import CustomRadio from '@/components/radio/CustomRadio'
import Row from '@/components/flexBox/row'
import { convertToNumber, formatInputNumber } from '@/utils/math'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import createFinanceAccount from '@/actions/finance/account/createFinanceAccount'
import FinanceAccountCategories from '@/types/finance/account/FinanceAccountCategories'
import confetti from 'canvas-confetti'
import createFinanceLog from '@/actions/finance/log/createFinanceLog'

// const CreateFinanceLogDialog = forwardRef(function Page(props, ref) )

export default function CreateFinanceAccountDialog({
  ref,
  refreshData
}: {
  ref: any
  refreshData: any
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [open, setOpen] = useState<boolean>(false)
  const [pickerOpen, setPickerOpen] = useState<boolean>(false)
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false)
  const [formData, setFormData] = useState<FinanceAccountType>({
    title: '',
    category: '',
    term: '',
    amount: 0,
    note: ''
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
    setSubmitButtonDisabled(true)
    const createdAccount = await createFinanceAccount(formData)

    if (createdAccount) {
      setOpen(false)
      toast.success('Created Account successfully!')

      await createFinanceLog({
        type: 'income',
        amount: formData.amount,
        category: 'calibration',
        note: `${formData.title} 계좌 생성`,
        paymentMethod: '',
        financeAccountPk: createdAccount.pk,
        date: new Date()
      })

      refreshData()
      setSubmitButtonDisabled(false)
      setFormData({
        title: '',
        category: '',
        term: '',
        amount: 0,
        note: ''
      })

      const end = Date.now() + 500 // 3 seconds
      const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

      const frame = () => {
        if (Date.now() > end) return

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
          zIndex: 9999
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
          zIndex: 9999
        })

        requestAnimationFrame(frame)
      }

      frame()
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
          <IconPig color={'#333'} />
        </div>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDialogContent-root': {
            backgroundColor: 'var(--color-sub-background)',
            height: 'fit-content',
            overflowY: 'hidden'
          }
        }}
      >
        <DialogContent>
          <Grid container sx={{ width: !isMobile ? '500px' : '100vw' }}>
            <Grid size={{ xs: 12, md: 12 }}>
              <CustomRadio
                name={'term'}
                list={[
                  { title: 'long', text: 'Long Term', icon: <IconTarget /> },
                  { title: 'short', text: 'Short Term', icon: <IconBolt /> }
                ]}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              <CustomRadio
                name={'category'}
                list={FinanceAccountCategories}
                onChange={handleChange}
                onlyIcon
                wrap
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }} className={'px-2 mt-2'}>
              <Row
                className={
                  'relative w-full rounded-md border-[2px] border-[#222] px-4 py-2 focus-within:border-[#dadada] duration-75'
                }
              >
                <input
                  name={'title'}
                  placeholder={'Title'}
                  className={'w-full outline-none !text-2xl ml-1 text-end'}
                  value={formData.title}
                  onChange={handleChange}
                  autoComplete='off'
                />
              </Row>
            </Grid>
            <Grid size={{ xs: 12, md: 12 }} className={'px-2 mt-2'}>
              <Row
                className={
                  'relative w-full rounded-md border-[2px] border-[#222] px-4 py-2 focus-within:border-[#dadada] duration-75'
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
            <Grid size={{ xs: 12, md: 12 }} className={'px-2 mt-2'}>
              <Row
                className={
                  'relative w-full rounded-md border-[2px] border-[#222] px-4 py-2 focus-within:border-[#dadada] duration-75'
                }
              >
                <textarea
                  rows={5}
                  name={'note'}
                  placeholder={'Title'}
                  className={'w-full outline-none !text-2xl ml-1 text-end'}
                  value={formData.note ?? ''}
                  onChange={handleChange}
                  autoComplete='off'
                />
              </Row>
            </Grid>
            <Grid size={{ xs: 12, md: 12 }} className={'pl-2 mt-2'}>
              <Row fullWidth className={'relative justify-between mt-2'}>
                {formData.amount !== 0 &&
                  formData.term !== '' &&
                  formData.category !== '' &&
                  formData.title !== '' && (
                    <Button
                      disabled={submitButtonDisabled}
                      variant={'outline'}
                      className={'cursor-pointer z-[10]'}
                      onClick={handleSubmit}
                    >
                      SUBMIT
                    </Button>
                  )}
              </Row>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}
