import { Redis } from '@upstash/redis'

export type Song = {
  videoId: string
  title: string
  thumbnail: string
}

export type AppState = {
  nowPlaying: Song | null
  queue: Song[]
  history: Song[]
  curatedList: Song[]
}

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!url || !token) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables')
  }
  
  return new Redis({ url, token })
}

let redisInstance: Redis | null = null

function getRedisInstance(): Redis {
  if (!redisInstance) {
    redisInstance = getRedis()
  }
  return redisInstance
}

const KEYS = {
  nowPlaying: 'singsync:nowPlaying',
  queue: 'singsync:queue',
  history: 'singsync:history',
} as const

const curatedList: Song[] = [
  { videoId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody — Queen", thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
  { videoId: "ZbZSe6N_BXs", title: "Happy — Pharrell Williams", thumbnail: "https://i.ytimg.com/vi/ZbZSe6N_BXs/hqdefault.jpg" },
  { videoId: "kJQP7kiw5Fk", title: "Despacito — Luis Fonsi", thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg" },
  { videoId: "RgKAFK5djSk", title: "See You Again — Wiz Khalifa", thumbnail: "https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg" },
  { videoId: "JGwWNGJdvx8", title: "Shape of You — Ed Sheeran", thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg" },
  { videoId: "hT_nvWreIhg", title: "Counting Stars — OneRepublic", thumbnail: "https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg" },
  { videoId: "YQHsXMglC9A", title: "Hello — Adele", thumbnail: "https://i.ytimg.com/vi/YQHsXMglC9A/hqdefault.jpg" },
  { videoId: "CevxZvSJLk8", title: "Roar — Katy Perry", thumbnail: "https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg" },
  { videoId: "nfWlot6h_JM", title: "Shake It Off — Taylor Swift", thumbnail: "https://i.ytimg.com/vi/nfWlot6h_JM/hqdefault.jpg" },
  { videoId: "09R8_2nJtjg", title: "Uptown Funk — Mark Ronson", thumbnail: "https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg" },
  { videoId: "e-ORhEE9VVg", title: "Blank Space — Taylor Swift", thumbnail: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg" },
  { videoId: "450p7goxZqg", title: "All Star — Smash Mouth", thumbnail: "https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg" },
  { videoId: "lp-EO5I60KA", title: "Eminem — Lose Yourself", thumbnail: "https://i.ytimg.com/vi/lp-EO5I60KA/hqdefault.jpg" },
  { videoId: "ZmDBbnmKFnQ", title: "Don't Stop Believin' — Journey", thumbnail: "https://i.ytimg.com/vi/ZmDBbnmKFnQ/hqdefault.jpg" },
  { videoId: "djV11Xbc914", title: "Take On Me — a-ha", thumbnail: "https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg" },
  { videoId: "rYEDA3JcQqw", title: "Rolling in the Deep — Adele", thumbnail: "https://i.ytimg.com/vi/rYEDA3JcQqw/hqdefault.jpg" },
  { videoId: "pRpeEdMmmQ0", title: "Shake It Off — Taylor Swift", thumbnail: "https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg" },
  { videoId: "fLexgOxsZu0", title: "The Lazy Song — Bruno Mars", thumbnail: "https://i.ytimg.com/vi/fLexgOxsZu0/hqdefault.jpg" },
  { videoId: "4fndeDfaWCg", title: "Backstreet Boys — I Want It That Way", thumbnail: "https://i.ytimg.com/vi/4fndeDfaWCg/hqdefault.jpg" },
  { videoId: "1w7OgIMMRc4", title: "Sweet Child O' Mine — Guns N' Roses", thumbnail: "https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg" },
]

function parseSong(data: unknown): Song | null {
  if (!data) return null
  if (typeof data === 'object') return data as Song
  if (typeof data === 'string') return JSON.parse(data) as Song
  return null
}

function parseSongArray(data: unknown): Song[] {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map(item => parseSong(item)).filter((item): item is Song => item !== null)
  }
  return []
}

export async function getState(): Promise<AppState> {
  const r = getRedisInstance()
  const [nowPlayingData, queueData, historyData] = await Promise.all([
    r.get<string>(KEYS.nowPlaying),
    r.lrange<string>(KEYS.queue, 0, -1),
    r.lrange<string>(KEYS.history, 0, -1),
  ])

  return {
    nowPlaying: parseSong(nowPlayingData),
    queue: parseSongArray(queueData),
    history: parseSongArray(historyData),
    curatedList,
  }
}

export async function addToQueue(song: Song): Promise<void> {
  await getRedisInstance().lpush(KEYS.queue, JSON.stringify(song))
}

export async function removeFromQueue(index: number): Promise<void> {
  const r = getRedisInstance()
  const queueData = await r.lrange<string>(KEYS.queue, 0, -1)
  const queue = parseSongArray(queueData)
  if (queue.length === 0) return

  const adjustedIndex = queue.length - 1 - index
  if (adjustedIndex < 0 || adjustedIndex >= queue.length) return

  await r.lrem(KEYS.queue, 1, JSON.stringify(queue[adjustedIndex]))
}

export async function reorderQueue(fromIndex: number, toIndex: number): Promise<void> {
  const r = getRedisInstance()
  const queueData = await r.lrange<string>(KEYS.queue, 0, -1)
  const queue = parseSongArray(queueData)
  if (queue.length === 0) return

  const queueLength = queue.length
  const adjustedFrom = queueLength - 1 - fromIndex
  const adjustedTo = queueLength - 1 - toIndex

  if (adjustedFrom < 0 || adjustedFrom >= queueLength) return
  if (adjustedTo < 0 || adjustedTo >= queueLength) return

  const [item] = queue.splice(adjustedFrom, 1)
  queue.splice(adjustedTo, 0, item)

  const updatedQueue = queue.reverse()
  await r.del(KEYS.queue)
  if (updatedQueue.length > 0) {
    await r.rpush(KEYS.queue, updatedQueue.map(song => JSON.stringify(song)))
  }
}

export async function advanceToNext(): Promise<{ nowPlaying: Song | null; queue: Song[] }> {
  const r = getRedisInstance()
  const queueData = await r.lrange<string>(KEYS.queue, 0, -1)
  const queue = parseSongArray(queueData)
  const nowPlayingData = await r.get<string>(KEYS.nowPlaying)
  const nowPlaying = parseSong(nowPlayingData)

  if (queue.length === 0) {
    await r.del(KEYS.nowPlaying)
    return { nowPlaying: null, queue: [] }
  }

  const [nextSong, ...remainingQueue] = queue

  await Promise.all([
    r.lpop<string>(KEYS.queue),
    r.set(KEYS.nowPlaying, JSON.stringify(nextSong)),
    nowPlaying ? r.lpush(KEYS.history, JSON.stringify(nowPlaying)) : Promise.resolve(),
  ])

  return { nowPlaying: nextSong, queue: remainingQueue }
}

export async function clearQueue(): Promise<void> {
  await getRedisInstance().del(KEYS.queue)
}
