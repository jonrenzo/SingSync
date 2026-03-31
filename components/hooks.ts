'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { AppState } from '@/lib/redis'

export function useSSE() {
  const [state, setState] = useState<AppState>({
    nowPlaying: null,
    queue: [],
    history: [],
    curatedList: [],
  })

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state', {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setState(data)
      }
    } catch (err) {
      // Silent fail, will retry on next poll
    }
  }, [])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 1000)
    return () => clearInterval(interval)
  }, [fetchState])

  const refresh = useCallback(async () => {
    await fetchState()
  }, [fetchState])

  return { state, refresh }
}

export function useYouTubePlayer(videoId: string | null, onEnd: () => void) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onEndRef = useRef(onEnd)

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  useEffect(() => {
    if (typeof YT !== 'undefined') return

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [])

  useEffect(() => {
    let destroyed = false

    function initPlayer() {
      if (!containerRef.current || destroyed) return

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId!)
        return
      }

      playerRef.current = new YT.Player('karaoke-player', {
        videoId: videoId!,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          playsinline: 1,
        } as YT.PlayerOptions['playerVars'],
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === YT.PlayerState.ENDED) {
              onEndRef.current()
            }
          },
        },
      })
    }

    if (!videoId) {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      return
    }

    if (typeof YT !== 'undefined' && YT.Player) {
      initPlayer()
    } else {
      const interval = setInterval(() => {
        if (destroyed) {
          clearInterval(interval)
          return
        }
        if (typeof YT !== 'undefined' && YT.Player && containerRef.current) {
          clearInterval(interval)
          initPlayer()
        }
      }, 100)

      return () => {
        destroyed = true
        clearInterval(interval)
        if (playerRef.current) {
          playerRef.current.destroy()
          playerRef.current = null
        }
      }
    }

    return () => {
      destroyed = true
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [videoId])

  return containerRef
}
