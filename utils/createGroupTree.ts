import GroupTreeType from '@/types/dev/GroupTreeType'
import { devLogGroupType } from '@/types/schemaType'

export default function createGroupTree(allGroupList: devLogGroupType[]) {
  let groupList: GroupTreeType[]

  // 최상단 그룹 탐색 (부모 없는 그룹)
  let topGroupList = allGroupList.filter(
    devLogGroup => devLogGroup.parentGroupPk === null
  )

  let limiter = 0

  const getLowerGroupList = (pk?: number) => {
    if (!pk) return

    if (limiter > 100) {
      console.log('\n\n\n==== Limit exceeded ====')
      return
    }

    // 자식 그룹 탐색
    let childGroupList: GroupTreeType[] = allGroupList.filter(
      devLogGroup => devLogGroup.parentGroupPk === pk
    )

    // 자식 그룹 있을 경우 -> 자식 그룹에 대하여 재귀 실행 후 반환
    if (childGroupList && childGroupList.length > 0) {
      childGroupList = childGroupList.map((group: GroupTreeType) => {
        limiter++
        const childGroupList = getLowerGroupList(group.pk)
        return {
          ...group,
          childGroupList
        }
      })
      return childGroupList
    }
    // 더이상 자식 그룹 없을 경우 -> 재귀 실행 하지 않고 반환
    else {
      return childGroupList
    }
  }

  groupList = topGroupList.map((group: GroupTreeType) => {
    const childGroupList = getLowerGroupList(group.pk)
    return {
      ...group,
      childGroupList
    }
  })

  return groupList
}
