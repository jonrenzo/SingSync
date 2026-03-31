import { type NextRequest, NextResponse } from 'next/server'
import { addToQueue } from '@/lib/redis'
import type { Song } from '@/lib/redis'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const song: Song = {
    videoId: body.videoId,
    title: body.title,
    thumbnail: body.thumbnail,
  }

  await addToQueue(song)
  return NextResponse.json({ success: true, song })
}
