import { type NextRequest, NextResponse } from 'next/server'
import { removeFromQueue } from '@/lib/redis'

export async function POST(request: NextRequest) {
  const body = await request.json()
  await removeFromQueue(body.index)
  return NextResponse.json({ success: true })
}
