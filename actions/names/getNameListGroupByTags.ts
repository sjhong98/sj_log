'use server'

import db from '@/supabase'
import { name, nameTag, nameTagRelation } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq, desc, like, inArray } from 'drizzle-orm'

export default async function getNameListGroupByTags() {
    const user = await getUser()
    if (!user) return

    const tagList = await db
        .select()
        .from(nameTag)
        .where(eq(nameTag.uid, user.id))

    const nameTagListByTag = await Promise.all(
        tagList.map(async (tag) => {
            const nameTagList = await db
                .select()
                .from(nameTagRelation)
                .where(eq(nameTagRelation.tagPk, tag.pk))
                .leftJoin(name, eq(nameTagRelation.namePk, name.pk))
                .orderBy(desc(name.createdAt))

            return {
                name: nameTagList.map((nameTag) => nameTag.name),
                tag: {...tag},
            }
        })
    )

    return nameTagListByTag
}
