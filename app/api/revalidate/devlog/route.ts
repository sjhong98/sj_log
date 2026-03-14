import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  revalidateTag('dev-log')
  return NextResponse.json({ success: true })
}
