import {
  IconAdjustmentsAlt,
  IconBeach,
  IconBus,
  IconDots,
  IconFish,
  IconGasStation,
  IconGlassGin,
  IconPigMoney,
  IconShoppingCart
} from '@tabler/icons-react'

const financeCategories = [
  {
    title: 'fuel',
    text: '주유',
    icon: <IconGasStation />,
    color: '#703B00'
  },
  { title: 'food', text: '음식', icon: <IconFish />, color: '#706905' },
  { title: 'alcohol', text: '술', icon: <IconGlassGin />, color: '#700600' },
  {
    title: 'shopping',
    text: '쇼핑',
    icon: <IconShoppingCart />,
    color: '#71006D'
  },
  { title: 'savings', text: '저금', icon: <IconPigMoney />, color: '#270070' },
  { title: 'transport', text: '교통', icon: <IconBus />, color: '#005971' },
  { title: 'travel', text: '여행', icon: <IconBeach />, color: '#007047' },
  { title: 'etc', text: '기타', icon: <IconDots />, color: '#547000' },
  {
    title: 'calibration',
    text: '조정',
    icon: <IconAdjustmentsAlt />,
    color: '#700036'
  }
]

export default financeCategories
