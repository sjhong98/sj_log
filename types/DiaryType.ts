export default interface DiaryType {
  pk?: number
  title: string
  content?: string
  contentText?: string
  date: Date
  uid?: string
  thumbnail?: string
  comments?: any[]
  createdAt?: Date
  isNewYear?: boolean
  isNewMonth?: boolean
}
