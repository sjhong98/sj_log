import { Grid } from '@mui/material'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import NumberFlow from '@number-flow/react'
import { IconCurrencyWon, IconX, IconTrash } from '@tabler/icons-react'
import DashboardContainer from '@/components/layouts/DashboardContainer'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import { useCallback, useMemo, useState } from 'react'
import { HyperText } from '@/components/magicui/hyper-text'
import deleteFinanceAccount from '@/actions/finance/account/deleteFinanceAccount'
import getLogsByAccountPk from '@/actions/finance/log/getLogsByAccountPk'
import { toast } from 'react-toastify'

export default function AccountDisplay({
  accounts,
  onAccountDeleted,
}: {
  accounts: FinanceAccountType[]
  onAccountDeleted?: () => void
}) {
  const [accountDetailOpen, setAccountDetailOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<FinanceAccountType | null>(null)
  const [accountLogs, setAccountLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    setShowDeleteConfirm(false)
  }, [])

  const handleDeleteAccount = useCallback(async (account: FinanceAccountType) => {
    if (!account?.pk) return
    
    setIsDeleting(true)
    try {
      await deleteFinanceAccount(account.pk)
      toast.success('계좌가 성공적으로 삭제되었습니다.')
      handleCloseAccountDetail()
      // 부모 컴포넌트에 삭제 완료 알림
      if (onAccountDeleted) {
        onAccountDeleted()
      }
    } catch (error) {
      console.error('계좌 삭제 오류:', error)
      toast.error('계좌 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }, [onAccountDeleted])

  const openDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false)
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
                <Row gap={2} className="items-center">
                  {/* 삭제 버튼 */}
                  <button
                    onClick={openDeleteConfirm}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                    title="계좌 삭제"
                  >
                    <IconTrash size={20} />
                  </button>
                  {/* 닫기 버튼 */}
                  <button
                    onClick={handleCloseAccountDetail}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IconX size={24} />
                  </button>
                </Row>
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

        {/* 삭제 확인 다이얼로그 */}
        {showDeleteConfirm && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <IconTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  계좌 삭제 확인
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  <strong>"{selectedAccount.title}"</strong> 계좌를 삭제하시겠습니까?<br />
                  이 작업은 되돌릴 수 없으며, 관련된 모든 거래 내역도 함께 삭제됩니다.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={closeDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(selectedAccount)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        삭제 중...
                      </div>
                    ) : (
                      '삭제'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Column>
    )
  }, [accounts, accountDetailOpen, selectedAccount, accountLogs, isLoadingLogs, showDeleteConfirm, isDeleting, handleOpenAccountDetail, handleCloseAccountDetail, openDeleteConfirm, closeDeleteConfirm, handleDeleteAccount])
}
