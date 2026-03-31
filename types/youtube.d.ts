declare namespace YT {
  interface PlayerOptions {
    videoId: string
    playerVars?: {
      autoplay?: number
      controls?: number
      modestbranding?: number
      rel?: number
      showinfo?: number
      iv_load_policy?: number
      disablekb?: number
    }
    events?: {
      onReady?: (event: { target: Player }) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onError?: (event: { data: number }) => void
    }
  }

  interface OnStateChangeEvent {
    data: number
    target: Player
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)
    loadVideoById(videoId: string): void
    destroy(): void
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
  }

  const PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}
