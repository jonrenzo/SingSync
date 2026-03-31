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

let state: AppState = {
  nowPlaying: null,
  queue: [],
  history: [],
  curatedList,
}

type Listener = (state: AppState) => void
const listeners: Set<Listener> = new Set()

function notify() {
  listeners.forEach((listener) => listener(state))
}

export function getState(): AppState {
  return state
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function addToQueue(song: Song) {
  state = { ...state, queue: [...state.queue, song] }
  notify()
}

export function removeFromQueue(index: number) {
  const newQueue = [...state.queue]
  newQueue.splice(index, 1)
  state = { ...state, queue: newQueue }
  notify()
}

export function reorderQueue(fromIndex: number, toIndex: number) {
  const newQueue = [...state.queue]
  const [item] = newQueue.splice(fromIndex, 1)
  newQueue.splice(toIndex, 0, item)
  state = { ...state, queue: newQueue }
  notify()
}

export function advanceToNext() {
  if (state.queue.length === 0) {
    state = { ...state, nowPlaying: null }
    notify()
    return
  }

  const [nextSong, ...remainingQueue] = state.queue
  const newHistory = state.nowPlaying ? [...state.history, state.nowPlaying] : state.history

  state = {
    ...state,
    nowPlaying: nextSong,
    queue: remainingQueue,
    history: newHistory,
  }
  notify()
}

export function clearQueue() {
  state = { ...state, queue: [] }
  notify()
}
