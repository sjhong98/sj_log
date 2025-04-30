export default interface CommentType {
  pk?: number
  uid?: string
  diaryPk: number
  content: string
  createdAt?: Date
}
