'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function getNameListGroupByTags() {
    const user = await getUser()
    if (!user) return

    const { data: tagList, error: tagListError } = await db
        .from('name_tag')
        .select('*')
        .eq('uid', user.id)

    if (tagListError) {
        console.error('Error fetching tag list:', tagListError)
        throw tagListError
    }

    const nameTagListByTag = await Promise.all(
        (tagList || []).map(async (tag) => {
            const { data: nameTagList, error: nameTagListError } = await db
                .from('name_tag_relation')
                .select(`
                    name (
                        *
                    )
                `)
                .eq('tag_pk', tag.pk)

            if (nameTagListError) {
                console.error('Error fetching name tag relations:', nameTagListError)
                throw nameTagListError
            }

            return {
                name: nameTagList?.map((relation: any) => relation.name) || [],
                tag: {...tag},
            }
        })
    )

    console.log('\n\n\nnameTagListByTag', nameTagListByTag)
    return nameTagListByTag
}
