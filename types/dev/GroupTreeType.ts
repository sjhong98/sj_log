import { devLogGroupType } from '@/types/schemaType'

export default interface GroupTreeType extends devLogGroupType {
  childGroupList: devLogGroupType[]
}
