import {
  IconDots,
  IconHome,
  IconLock,
  IconMoneybag,
  IconTimeline
} from '@tabler/icons-react'

const FinanceAccountCategories = [
  { title: 'savings', text: '적금', icon: <IconLock /> },
  { title: 'investment', text: '투자', icon: <IconTimeline /> },
  { title: 'account', text: '계좌', icon: <IconMoneybag /> },
  { title: 'housing', text: '청약', icon: <IconHome /> },
  { title: 'etc', text: '기타', icon: <IconDots /> }
]

export default FinanceAccountCategories
