import {
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import FinanceLogType from '@/types/finance/FinanceLogType'
import dayjs from 'dayjs'
import DashboardContainer from '@/components/layouts/DashboardContainer'
import Row from '@/components/flexBox/row'
import NumberFlow from '@number-flow/react'
import {
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Typography
} from '@mui/material'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyWon,
  IconFilter,
  IconX
} from '@tabler/icons-react'
import Column from '@/components/flexBox/column'
import FinanceCategories from '@/types/finance/FinanceCategories'
import financeCategories from '@/types/finance/FinanceCategories'
import { formatInputNumber } from '@/utils/math'
import getMonthlyLogs from '@/actions/finance/log/getMonthlyLogs'
import { PlusIcon } from 'lucide-react'

let currentGetMonthLogRequestId = 0

export default function MonthlyLogsDisplay({ ref }: { ref: any }) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [logs, setLogs] = useState<FinanceLogType[]>([])
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [trend, setTrend] = useState<any>(1)
  const [monthNumberFlowTiming, setMonthNumberFlowTiming] =
    useState<number>(1500)
  const [totalIncomes, setTotalIncomes] = useState<number>(0)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [options, setOptions] = useState<any>()

  useEffect(() => {
    refreshData()
  }, [])

  useEffect(() => {
    let _totalIncomes = 0
    let _totalExpenses = 0
    logs.forEach(log => {
      log.type === 'income'
        ? (_totalIncomes += log.amount ?? 0)
        : (_totalExpenses += log.amount ?? 0)
    })
    setTotalIncomes(_totalIncomes)
    setTotalExpenses(_totalExpenses)
  }, [logs])

  const handleSubtractMonth = async () => {
    let changedMonth = month
    let changedYear = year

    if (month !== 1) changedMonth -= 1
    else {
      changedMonth = 12
      changedYear = changedYear -= 1
    }

    setMonth(changedMonth)
    setYear(changedYear)
    setTrend(-1)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      const monthlyLogs = await getMonthlyLogs(
        changedYear,
        changedMonth,
        options
      )
      if (monthlyLogs) setLogs(monthlyLogs)
    }, 300)
  }

  const handleAddMonth = async () => {
    let changedMonth = month
    let changedYear = year

    if (month !== 12) changedMonth += 1
    else {
      changedMonth = 1
      changedYear = changedYear += 1
    }

    setMonth(changedMonth)
    setYear(changedYear)
    setTrend(1)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      const monthlyLogs = await getMonthlyLogs(
        changedYear,
        changedMonth,
        options
      )
      if (monthlyLogs) setLogs(monthlyLogs)
    }, 300)
  }

  const handleChangeFilter = useCallback(
    async (idx?: number) => {
      if (idx === undefined) {
        setOptions(undefined)
        const monthlyLogs = await getMonthlyLogs(year, month)
        if (monthlyLogs) setLogs(monthlyLogs)
        return
      }
      let newOptions = { ...options, filter: idx }
      setOptions(newOptions)

      const monthlyLogs = await getMonthlyLogs(year, month, newOptions)
      if (monthlyLogs) setLogs(monthlyLogs)
    },
    [month, year, options]
  )

  useEffect(() => {
    setTimeout(() => {
      setMonthNumberFlowTiming(300)
    }, 1500)
  }, [])

  const refreshData = useCallback(async () => {
    const changedMonth = dayjs().get('month') + 1
    const changedYear = dayjs().get('year')
    setMonth(changedMonth)
    setYear(changedYear)

    const monthlyLogs = await getMonthlyLogs(changedYear, changedMonth)
    setLogs(monthlyLogs)
  }, [])

  useImperativeHandle(ref, () => {
    return {
      refreshData
    }
  })

  const actions = financeCategories.map((category, i) => {
    return {
      icon: (
        <div
          className={
            'p-[9px] rounded-full cursor-pointer hover:scale-[1.2] duration-75 shadow-2xl'
          }
          style={{ backgroundColor: category.color }}
          onClick={async () => {
            await handleChangeFilter(i)
          }}
        >
          {category.icon}
        </div>
      ),
      name: category.text,
      color: category.color
    }
  })

  return (
    <>
      <DashboardContainer
        title={'monthly logs'}
        action={
          <Row gap={1} className={'items-start absolute right-0'}>
            {options?.filter !== null && options?.filter !== undefined && (
              <Column className={'relative group'}>
                <div
                  className={
                    'p-[9px] rounded-full cursor-pointer duration-75 shadow-2xl'
                  }
                  style={{
                    backgroundColor: financeCategories[options.filter].color
                  }}
                  onClick={() => {
                    handleChangeFilter()
                  }}
                >
                  {financeCategories[options.filter].icon}
                </div>
                <div
                  className={
                    'p-[9px] rounded-full cursor-pointer duration-100 shadow-2xl absolute bg-red-500 group-hover:scale-[1] scale-0'
                  }
                  onClick={() => {
                    handleChangeFilter()
                  }}
                >
                  <IconX />
                </div>
              </Column>
            )}
            <SpeedDial
              direction={'down'}
              ariaLabel='Filter'
              sx={{
                '& .MuiButtonBase-root': {
                  backgroundColor: '#dadada !important',
                  maxWidth: '41px !important',
                  height: '40px !important'
                }
              }}
              icon={<IconFilter />}
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
        }
      >
        <Column gap={1}>
          <Row fullWidth gap={1} className={'justify-center items-center'}>
            {/*  previous month  */}
            <IconButton onClick={handleSubtractMonth}>
              <IconChevronLeft />
            </IconButton>
            {/*  current month display  */}
            <Row
              className={'justify-center items-center w-[120px] gap-[2px] mt-1'}
            >
              <NumberFlow
                value={year}
                format={{ useGrouping: false }}
                className={'text-2xl font2'}
                trend={trend}
                spinTiming={{
                  duration: monthNumberFlowTiming,
                  easing: 'cubic-bezier(.74,.23,.16,1.02)'
                }}
              />
              <p className={'text-xl mt-2'}>.</p>
              <Row className={'min-w-[40px]'}>
                <NumberFlow
                  value={month}
                  format={{ useGrouping: false, minimumIntegerDigits: 2 }}
                  className={'text-2xl font2'}
                  trend={trend}
                  spinTiming={{
                    duration: monthNumberFlowTiming,
                    easing: 'cubic-bezier(.74,.23,.16,1.02)'
                  }}
                />
              </Row>
            </Row>
            {/*  next month  */}
            <IconButton onClick={handleAddMonth}>
              <IconChevronRight />
            </IconButton>
          </Row>
          <Row fullWidth className={'justify-center'} gap={4}>
            <Column className={'items-end'}>
              <Row className={'items-center text-green-500'}>
                <Typography className={'font2'}>+</Typography>
                <NumberFlow
                  value={totalIncomes}
                  className={'font2 !text-2xl'}
                />
                <IconCurrencyWon />
              </Row>
              <Row className={'items-center text-red-500 mt-[-8Authpx]'}>
                <Typography className={'font2'}>-</Typography>
                <NumberFlow
                  value={totalExpenses}
                  className={'font2 !text-2xl'}
                />
                <IconCurrencyWon />
              </Row>
            </Column>
          </Row>
        </Column>
        <Column gap={1} className={'pb-4'}>
          {logs.length > 0 ? (
            <Column
              gap={1}
              className={'min-h-[300px] opacity-0 opacity-up-appear'}
            >
              {logs.map((log: FinanceLogType, i) => {
                return (
                  <Fragment key={i}>
                    {log.isNewDay && (
                      <Row fullWidth className={'px-6 font2 mt-4'}>
                        {dayjs(log.date).get('date')}
                      </Row>
                    )}
                    <Row
                      className={
                        'px-4 py-3 bg-[#141414] rounded-xl justify-between hover:scale-[1.008] duration-100 group'
                      }
                    >
                      <Row gap={2}>
                        <Row gap={2}>
                          <Row
                            className={
                              'p-2 rounded-xl group-hover:scale-[1.05] duration-100 w-[40px] h-[40px]'
                            }
                            style={{
                              backgroundColor: FinanceCategories.find(
                                c => c.title === log.category
                              )?.color ?? '#00c951'
                            }}
                          >
                            {
                              FinanceCategories.find(
                                c => c.title === log.category
                              )?.icon ?? <PlusIcon />
                            }
                          </Row>
                        </Row>
                        <Column className='flex justify-center'>
                          <p
                            className={
                              'uppercase text-[18px] font-bold text-[#dadada]'
                            }
                          >
                            {
                              FinanceCategories.find(
                                c => c.title === log.category
                              )?.text ?? log.category
                            }
                          </p>
                          {log.note !== '' && (
                            <p
                              className={
                                'uppercase !mt-[-2px] text-sm text-[#dadada]'
                              }
                            >
                              {log.note}
                            </p>
                          )}
                        </Column>
                      </Row>
                      <Row gap={1} className={'items-center text-[#dadada]'}>
                        <Typography
                          variant={'subtitle2'}
                          color={'#555'}
                          className={'!mr-1 font2 !text-[12px]'}
                        >
                          {dayjs(log.date).format('HH:mm')}
                        </Typography>
                        <Row className={'items-center'}>
                          <Typography
                            className={`font2 text-[16px] ${log.type === 'income' ? '!text-green-500' : '!text-red-500'}`}
                          >
                            {log.type === 'income' ? '+' : '-'}
                          </Typography>
                          <Typography
                            variant={'h5'}
                            className={`font2 ${log.type === 'income' ? '!text-green-500' : '!text-red-500'}`}
                          >
                            {`${formatInputNumber(log?.amount ?? 0)}`}
                          </Typography>
                          <IconCurrencyWon
                            className={`${log.type === 'income' ? '!text-green-500' : '!text-red-500'}`}
                          />
                        </Row>
                      </Row>
                    </Row>
                  </Fragment>
                )
              })}
            </Column>
          ) : (
            <Column
              fullWidth
              className={'h-[300px] items-center justify-center'}
            >
              <Typography className={'font2'}>No logs yet.</Typography>
            </Column>
          )}
        </Column>
      </DashboardContainer>
    </>
  )
}
