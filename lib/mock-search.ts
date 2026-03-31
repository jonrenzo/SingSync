import type { Song } from './store'

const mockDatabase: Song[] = [
  { videoId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody — Queen (Karaoke Version)", thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
  { videoId: "ZbZSe6N_BXs", title: "Happy — Pharrell Williams (Karaoke)", thumbnail: "https://i.ytimg.com/vi/ZbZSe6N_BXs/hqdefault.jpg" },
  { videoId: "kJQP7kiw5Fk", title: "Despacito — Luis Fonsi (Karaoke)", thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg" },
  { videoId: "JGwWNGJdvx8", title: "Shape of You — Ed Sheeran (Karaoke)", thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg" },
  { videoId: "hT_nvWreIhg", title: "Counting Stars — OneRepublic (Karaoke)", thumbnail: "https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg" },
  { videoId: "YQHsXMglC9A", title: "Hello — Adele (Karaoke Version)", thumbnail: "https://i.ytimg.com/vi/YQHsXMglC9A/hqdefault.jpg" },
  { videoId: "CevxZvSJLk8", title: "Roar — Katy Perry (Karaoke)", thumbnail: "https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg" },
  { videoId: "nfWlot6h_JM", title: "Shake It Off — Taylor Swift (Karaoke)", thumbnail: "https://i.ytimg.com/vi/nfWlot6h_JM/hqdefault.jpg" },
  { videoId: "09R8_2nJtjg", title: "Uptown Funk — Mark Ronson (Karaoke)", thumbnail: "https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg" },
  { videoId: "e-ORhEE9VVg", title: "Blank Space — Taylor Swift (Karaoke)", thumbnail: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg" },
  { videoId: "450p7goxZqg", title: "All Star — Smash Mouth (Karaoke)", thumbnail: "https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg" },
  { videoId: "lp-EO5I60KA", title: "Lose Yourself — Eminem (Karaoke)", thumbnail: "https://i.ytimg.com/vi/lp-EO5I60KA/hqdefault.jpg" },
  { videoId: "ZmDBbnmKFnQ", title: "Don't Stop Believin' — Journey (Karaoke)", thumbnail: "https://i.ytimg.com/vi/ZmDBbnmKFnQ/hqdefault.jpg" },
  { videoId: "djV11Xbc914", title: "Take On Me — a-ha (Karaoke)", thumbnail: "https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg" },
  { videoId: "rYEDA3JcQqw", title: "Rolling in the Deep — Adele (Karaoke)", thumbnail: "https://i.ytimg.com/vi/rYEDA3JcQqw/hqdefault.jpg" },
  { videoId: "fLexgOxsZu0", title: "The Lazy Song — Bruno Mars (Karaoke)", thumbnail: "https://i.ytimg.com/vi/fLexgOxsZu0/hqdefault.jpg" },
  { videoId: "4fndeDfaWCg", title: "I Want It That Way — Backstreet Boys (Karaoke)", thumbnail: "https://i.ytimg.com/vi/4fndeDfaWCg/hqdefault.jpg" },
  { videoId: "1w7OgIMMRc4", title: "Sweet Child O' Mine — Guns N' Roses (Karaoke)", thumbnail: "https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg" },
  { videoId: "RgKAFK5djSk", title: "See You Again — Wiz Khalifa (Karaoke)", thumbnail: "https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg" },
  { videoId: "pRpeEdMmmQ0", title: "Shake It Off — Taylor Swift (Karaoke)", thumbnail: "https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg" },
  { videoId: "dQw4w9WgXcQ", title: "Never Gonna Give You Up — Rick Astley (Karaoke)", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
  { videoId: "y6120QOlsfU", title: "Darude — Sandstorm (Karaoke)", thumbnail: "https://i.ytimg.com/vi/y6120QOlsfU/hqdefault.jpg" },
  { videoId: "oHg5SJYRHA0", title: "RickRoll'D — Rick Astley (Karaoke)", thumbnail: "https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg" },
]

export async function searchSongs(query: string): Promise<Song[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!query.trim()) {
    return mockDatabase.slice(0, 8)
  }

  const lowerQuery = query.toLowerCase()
  const results = mockDatabase.filter((song) =>
    song.title.toLowerCase().includes(lowerQuery)
  )

  if (results.length === 0) {
    return [
      {
        videoId: `mock_${Date.now()}`,
        title: `${query} (Karaoke Version)`,
        thumbnail: `https://picsum.photos/seed/${encodeURIComponent(query)}/320/180`,
      },
      {
        videoId: `mock_${Date.now() + 1}`,
        title: `${query} — Acoustic Karaoke`,
        thumbnail: `https://picsum.photos/seed/${encodeURIComponent(query) + 1}/320/180`,
      },
      {
        videoId: `mock_${Date.now() + 2}`,
        title: `${query} — Piano Karaoke`,
        thumbnail: `https://picsum.photos/seed/${encodeURIComponent(query) + 2}/320/180`,
      },
    ]
  }

  return results
}
