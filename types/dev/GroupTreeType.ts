import { devLogGroupType, devLogType } from '@/types/schemaType'

export default interface GroupTreeType extends devLogGroupType {
  childGroupList?: devLogGroupType[]
  posts?: devLogType[]
}
