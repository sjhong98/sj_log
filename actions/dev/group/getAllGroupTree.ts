'use server'

import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { getUser } from '@/actions/session/getUser'
import { devLogGroupType } from '@/types/schemaType'

interface TreeType extends devLogGroupType {
  childGroupList?: TreeType[]
}

export default async function getAllGroupTree() {
  let user: any = await getUser()
  if (!user) return null

  let groupList: TreeType[]

  let topGroupList = await db
    .select()
    .from(devLogGroup)
    .where(and(eq(devLogGroup.uid, user.id), isNull(devLogGroup.parentGroupPk)))

  let limiter = 0

  const getLowerGroupList = async (pk: number) => {
    if (limiter > 100) {
      console.log('\n\n\n==== Limit exceeded ====')
      return
    }

    let childGroupList: TreeType[] = await db
      .select()
      .from(devLogGroup)
      .where(eq(devLogGroup.parentGroupPk, pk))

    if (childGroupList && childGroupList.length > 0) {
      childGroupList = await Promise.all(
        childGroupList.map(async (group: TreeType) => {
          limiter++
          const childGroupList = await getLowerGroupList(group.pk)
          return {
            ...group,
            childGroupList
          }
        })
      )
      return childGroupList
    } else return childGroupList
  }

  groupList = await Promise.all(
    topGroupList.map(async (group: TreeType) => {
      const childGroupList = await getLowerGroupList(group.pk)
      return {
        ...group,
        childGroupList
      }
    })
  )

  return groupList
}
