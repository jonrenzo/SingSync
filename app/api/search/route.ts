import { type NextRequest, NextResponse } from 'next/server'
import { searchSongs } from '@/lib/youtube-search'

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q') || ''
    const results = await searchSongs(query)
    return NextResponse.json(results)
  } catch (err) {
    console.error('Search API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Search failed' },
      { status: 500 }
    )
  }
}
