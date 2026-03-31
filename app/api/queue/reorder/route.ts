import { type NextRequest, NextResponse } from 'next/server'
import { reorderQueue } from '@/lib/redis'

export async function POST(request: NextRequest) {
  const body = await request.json()
  await reorderQueue(body.fromIndex, body.toIndex)
  return NextResponse.json({ success: true })
}
