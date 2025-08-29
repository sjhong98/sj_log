import { Grid } from '@mui/material'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import NumberFlow from '@number-flow/react'
import { IconCurrencyWon, IconX } from '@tabler/icons-react'
import DashboardContainer from '@/components/layouts/DashboardContainer'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import { useCallback, useMemo, useState } from 'react'
import { HyperText } from '@/components/magicui/hyper-text'
import deleteFinanceAccount from '@/actions/finance/account/deleteFinanceAccount'
import getLogsByAccountPk from '@/actions/finance/log/getLogsByAccountPk'
import { toast } from 'react-toastify'

export default function AccountDisplay({
  accounts,
}: {
  accounts: FinanceAccountType[]
}) {
  const [accountDetailOpen, setAccountDetailOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<FinanceAccountType | null>(null)
  const [accountLogs, setAccountLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const handleOpenAccountDetail = useCallback(async (account: FinanceAccountType) => {
    setSelectedAccount(account)
    setAccountDetailOpen(true)
    setIsLoadingLogs(true)
    
    try {
      if (account.pk) {
        const logs = await getLogsByAccountPk(account.pk)
        setAccountLogs(logs || [])
      }
    } catch (error) {
      console.error('로그 로딩 오류:', error)
      toast.error('거래 내역을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoadingLogs(false)
    }
  }, [])

  const handleCloseAccountDetail = useCallback(() => {
    setAccountDetailOpen(false)
    setSelectedAccount(null)
    setAccountLogs([])
  }, [])

  const handleDeleteAccount = useCallback(async (account: FinanceAccountType) => {
    if(account?.pk) await deleteFinanceAccount(account.pk)
  }, [])

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
                        'justify-between items-end flex-wrap mb-[-12px] hover:scale-[1.05] duration-75 cursor-pointer'
                      }
                      sx={{ transformOrigin: 'right' }}
                      onClick={() => handleOpenAccountDetail(account)}
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
                        'justify-between items-end flex-wrap mb-[-10px] hover:scale-[1.05] duration-75 cursor-pointer'
                      }
                      sx={{ transformOrigin: 'right' }}
                      onClick={() => handleOpenAccountDetail(account)}
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

        {/* 계좌 상세 정보 모달 */}
        {accountDetailOpen && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* 헤더 */}
              <Row className="justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedAccount.title}
                </h2>
                <button
                  onClick={handleCloseAccountDetail}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IconX size={24} />
                </button>
              </Row>

              {/* 계좌 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">카테고리</label>
                    <p className="text-lg text-gray-800">{selectedAccount.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">기간</label>
                    <p className="text-lg text-gray-800">
                      {selectedAccount.term === 'long' ? 'Long Term' : 'Short Term'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">현재 잔액</label>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedAccount.amount?.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">메모</label>
                    <p className="text-lg text-gray-800">
                      {selectedAccount.note || '메모 없음'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 거래 내역 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">거래 내역</h3>
                {isLoadingLogs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">거래 내역을 불러오는 중...</p>
                  </div>
                ) : accountLogs.length > 0 ? (
                  <div className="space-y-3">
                    {accountLogs.map((log, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.type === 'income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.type === 'income' ? '수입' : '지출'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(log.date).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 mt-1">{log.note || '메모 없음'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            log.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {log.type === 'income' ? '+' : '-'}
                            {log.amount?.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    거래 내역이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Column>
    )
  }, [accounts, accountDetailOpen, selectedAccount, accountLogs, isLoadingLogs, handleOpenAccountDetail, handleCloseAccountDetail])
}
