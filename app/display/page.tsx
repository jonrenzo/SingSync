'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSSE, useYouTubePlayer } from '@/components/hooks'
import QRCodeDisplay from '@/components/qr-code'

export default function DisplayPage() {
  const { state } = useSSE()
  const [showQR, setShowQR] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showEmptyMessage, setShowEmptyMessage] = useState(false)

  const handleSongEnd = useCallback(async () => {
    await fetch('/api/queue/advance', { method: 'POST' })
  }, [])

  const playNext = useCallback(async () => {
    if (state.queue.length === 0 && !state.nowPlaying) {
      setShowEmptyMessage(true)
      setTimeout(() => setShowEmptyMessage(false), 2000)
      return
    }
    await fetch('/api/queue/advance', { method: 'POST' })
  }, [state.queue.length, state.nowPlaying])

  const playerRef = useYouTubePlayer(state.nowPlaying?.videoId || null, handleSongEnd)

  const toggleMute = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yt = window.YT as any
    if (yt && yt.get) {
      const player = yt.get('karaoke-player')
      if (player && player.unMute) {
        if (isMuted) {
          player.unMute()
        } else {
          player.mute()
        }
        setIsMuted(!isMuted)
      }
    }
  }, [isMuted])

  const [queueUrl, setQueueUrl] = useState('/queue')

  useEffect(() => {
    fetch('/api/network')
      .then((r) => r.json())
      .then(({ localIp, port }) => {
        if (localIp && localIp !== 'localhost') {
          setQueueUrl(`http://${localIp}:${port}/queue`)
        } else {
          setQueueUrl(`${window.location.origin}/queue`)
        }
      })
      .catch(() => {
        setQueueUrl(`${window.location.origin}/queue`)
      })
  }, [])

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* YouTube Player — full screen */}
      {state.nowPlaying && (
        <div className="fixed inset-0 w-full h-full">
          <div id="karaoke-player" ref={playerRef} className="w-full h-full" />
        </div>
      )}

      {/* Idle screen — black screen with PLAY NEXT */}
      {!state.nowPlaying && state.queue.length > 0 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center">
          <button
            onClick={playNext}
            className="bg-gradient-to-br from-karaoke-primary to-[#ff6b9d] text-white font-display tracking-[2px] border-none rounded-xl py-6 px-12 text-2xl cursor-pointer transition-all uppercase hover:scale-105 hover:shadow-[0_0_30px_var(--color-karaoke-primary-glow)] active:scale-95"
          >
            PLAY NEXT
          </button>
          <p className="text-karaoke-text-muted text-sm mt-6 font-body">
            {state.queue.length} song{state.queue.length !== 1 ? 's' : ''} in queue
          </p>
        </div>
      )}

      {/* Bottom overlay — title and controls */}
      {state.nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="bg-black/70 backdrop-blur-md border-t border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-karaoke-text text-sm font-body truncate pr-4 max-w-[60%]">
                {state.nowPlaying.title}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={toggleMute}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <span className="font-body text-sm">{isMuted ? 'UNMUTE' : 'MUTE'}</span>
                </button>
                <button
                  onClick={playNext}
                  className="px-4 py-2 rounded-lg bg-karaoke-primary text-white hover:shadow-[0_0_20px_var(--color-karaoke-primary-glow)] transition-all"
                >
                  <span className="font-body text-sm">SKIP</span>
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <span className="font-body text-sm">QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty queue message */}
      {showEmptyMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 bg-karaoke-danger text-white px-6 py-3 rounded-lg font-body text-sm">
          Queue is empty
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div 
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-karaoke-surface p-8 rounded-2xl border border-karaoke-border shadow-[0_0_10px_var(--color-karaoke-primary-glow)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl text-karaoke-primary text-center mb-4 tracking-wider">
              SCAN TO JOIN
            </h3>
            <div className="flex justify-center mb-4">
              <QRCodeDisplay url={queueUrl} size={180} />
            </div>
            <p className="text-karaoke-text-muted text-center text-xs">
              Open on your phone to control the queue
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-6 w-full bg-gradient-to-br from-karaoke-primary to-[#ff6b9d] text-white font-display tracking-[2px] border-none rounded-lg py-3 px-6 text-sm cursor-pointer transition-all uppercase hover:scale-105 active:scale-95"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
