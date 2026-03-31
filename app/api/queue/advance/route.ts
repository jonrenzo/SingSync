import { NextResponse } from 'next/server'
import { advanceToNext } from '@/lib/redis'

export async function POST() {
  const result = await advanceToNext()
  return NextResponse.json({ success: true, ...result })
}
