import { devLogGroupType, devLogType } from '@/types/schemaType'

export default interface BoardType {
  currentGroup: devLogGroupType | null
  upperGroupList: devLogGroupType[] | null
  lowerGroupList: devLogGroupType[]
  posts: devLogType[]
}
