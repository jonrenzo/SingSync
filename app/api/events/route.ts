import { type NextRequest, NextResponse } from 'next/server'
import { getState } from '@/lib/redis'

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has('poll')) {
    const state = await getState()
    return NextResponse.json(state)
  }

  return NextResponse.json({ error: 'Use /api/state for polling' }, { status: 400 })
}
