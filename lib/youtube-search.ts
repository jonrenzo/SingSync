import type { Song } from './store'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function searchSongs(query: string): Promise<Song[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not set')
  }

  const searchParams = new URLSearchParams({
    part: 'id',
    q: `${query} karaoke`,
    type: 'video',
    maxResults: '20',
    key: YOUTUBE_API_KEY,
  })

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
  )

  if (!searchRes.ok) {
    const error = await searchRes.text()
    throw new Error(`YouTube API error ${searchRes.status}: ${error}`)
  }

  const searchData = await searchRes.json()

  if (!searchData.items || searchData.items.length === 0) {
    return []
  }

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

  const videoParams = new URLSearchParams({
    part: 'snippet,status',
    id: videoIds,
    key: YOUTUBE_API_KEY,
  })

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${videoParams.toString()}`
  )

  if (!videoRes.ok) {
    const error = await videoRes.text()
    throw new Error(`YouTube API error ${videoRes.status}: ${error}`)
  }

  const videoData = await videoRes.json()

  return videoData.items
    .filter((item: any) => item.status?.embeddable !== false)
    .map((item: any) => ({
      videoId: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
    }))
}
