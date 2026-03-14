'use server'

import { revalidateTag } from 'next/cache'

export default async function revalidateDevLog() {
  revalidateTag('dev-log')
}
