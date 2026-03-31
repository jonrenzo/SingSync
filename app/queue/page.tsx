'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSSE } from '@/components/hooks'
import type { Song } from '@/lib/store'

export default function QueuePage() {
  const { state, refresh } = useSSE()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'queue' | 'songbook'>('queue')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isAdding, setIsAdding] = useState<string | null>(null)

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.error || `Server error ${res.status}`)
        }

        const results = await res.json()
        setSearchResults(results)

        if (results.length === 0) {
          showNotification('No results found', 'error')
        }
      } catch (err: any) {
        console.error('Search error:', err)
        if (err.name === 'AbortError') {
          showNotification('Search timed out. Check your connection.', 'error')
        } else {
          showNotification(err.message || 'Search failed. Try again.', 'error')
        }
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, showNotification])

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // Trigger immediate search by briefly clearing and resetting
      const currentQuery = searchQuery
      setSearchResults([])
      setIsSearching(true)

      fetch(`/api/search?q=${encodeURIComponent(currentQuery)}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => null)
            throw new Error(errorData?.error || `Server error ${res.status}`)
          }
          return res.json()
        })
        .then((results) => {
          setSearchResults(results)
          if (results.length === 0) {
            showNotification('No results found', 'error')
          }
        })
        .catch((err) => {
          console.error('Search error:', err)
          showNotification(err.message || 'Search failed. Try again.', 'error')
        })
        .finally(() => {
          setIsSearching(false)
        })
    }
  }, [searchQuery, showNotification])

  const addToQueue = async (song: Song) => {
    setIsAdding(song.videoId)
    try {
      const res = await fetch('/api/queue/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song),
      })
      if (!res.ok) throw new Error('Failed to add song')
      await refresh()
      showNotification(`Added "${song.title}" to queue`, 'success')
    } catch (err) {
      console.error('Add to queue error:', err)
      showNotification('Failed to add song. Try again.', 'error')
    } finally {
      setIsAdding(null)
    }
  }

  const removeFromQueue = async (index: number) => {
    try {
      await fetch('/api/queue/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      })
      await refresh()
    } catch (err) {
      console.error('Remove from queue error:', err)
      showNotification('Failed to remove song.', 'error')
    }
  }

  const moveUp = async (index: number) => {
    if (index === 0) return
    try {
      await fetch('/api/queue/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromIndex: index, toIndex: index - 1 }),
      })
      await refresh()
    } catch (err) {
      console.error('Reorder error:', err)
    }
  }

  const moveDown = async (index: number) => {
    if (index === state.queue.length - 1) return
    try {
      await fetch('/api/queue/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromIndex: index, toIndex: index + 1 }),
      })
      await refresh()
    } catch (err) {
      console.error('Reorder error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-karaoke-bg">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg font-body text-sm ${
              notification.type === 'success'
                ? 'bg-karaoke-success text-karaoke-bg'
                : 'bg-karaoke-danger text-white'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-karaoke-surface/90 backdrop-blur-md border-b border-karaoke-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="font-display text-4xl text-karaoke-primary animate-pulse-glow tracking-wider text-center">
            SINGSYNC
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search Section */}
        <section className="bg-gradient-to-br from-karaoke-surface to-karaoke-surface-light border border-karaoke-border rounded-xl p-6 transition-all hover:border-karaoke-primary hover:shadow-[0_0_20px_var(--color-karaoke-primary-glow)]">
          <h2 className="font-display text-2xl text-karaoke-secondary mb-4 tracking-wider">
            SEARCH SONGS
          </h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                placeholder="Search for karaoke songs..."
                className="w-full bg-karaoke-surface border-2 border-karaoke-border rounded-lg py-3 px-4 text-karaoke-text font-body text-base transition-all placeholder:text-karaoke-text-muted focus:outline-none focus:border-karaoke-primary focus:shadow-[0_0_15px_var(--color-karaoke-primary-glow)] [-webkit-text-fill-color:var(--color-karaoke-text)] [color-scheme:dark]"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-karaoke-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-br from-karaoke-primary to-[#ff6b9d] text-white font-display tracking-[2px] border-none rounded-lg py-3 px-6 cursor-pointer transition-all uppercase hover:scale-105 hover:shadow-[0_0_30px_var(--color-karaoke-primary-glow)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSearching ? '...' : 'SEARCH'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((song) => (
                <div
                  key={song.videoId}
                  className="flex items-center gap-4 p-3 rounded-lg bg-karaoke-surface-light border border-karaoke-border hover:border-karaoke-primary transition-all"
                >
                  <img
                    src={song.thumbnail}
                    alt=""
                    className="w-20 h-12 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-karaoke-text truncate">{song.title}</p>
                  </div>
                  <button
                    onClick={() => addToQueue(song)}
                    disabled={isAdding === song.videoId}
                    className="bg-gradient-to-br from-karaoke-primary to-[#ff6b9d] text-white font-display tracking-[2px] border-none rounded-lg py-3 px-6 text-sm cursor-pointer transition-all uppercase hover:scale-105 hover:shadow-[0_0_30px_var(--color-karaoke-primary-glow)] active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isAdding === song.videoId ? 'ADDING...' : 'ADD'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No results after searching */}
          {searchResults.length === 0 && !isSearching && searchQuery.trim() && (
            <div className="mt-4 text-center py-8">
              <p className="text-karaoke-text-muted">No results found</p>
              <p className="text-karaoke-text-muted text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </section>

        {/* Now Playing */}
        {state.nowPlaying && (
          <section className="bg-gradient-to-br from-karaoke-surface to-karaoke-surface-light border border-karaoke-primary rounded-xl p-6 shadow-[0_0_10px_var(--color-karaoke-primary-glow),inset_0_0_10px_var(--color-karaoke-primary-glow)]">
            <h2 className="font-display text-2xl text-karaoke-primary mb-4 tracking-wider">
              NOW PLAYING
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={state.nowPlaying.thumbnail}
                alt=""
                className="w-24 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="text-karaoke-text text-lg font-medium">
                  {state.nowPlaying.title}
                </p>
                <p className="text-karaoke-text-muted text-sm">
                  Playing on display screen
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-3 rounded-lg font-display tracking-wider transition-all ${
              activeTab === 'queue'
                ? 'bg-karaoke-primary text-white'
                : 'bg-karaoke-surface text-karaoke-text-muted border border-karaoke-border'
            }`}
          >
            QUEUE ({state.queue.length})
          </button>
          <button
            onClick={() => setActiveTab('songbook')}
            className={`flex-1 py-3 rounded-lg font-display tracking-wider transition-all ${
              activeTab === 'songbook'
                ? 'bg-karaoke-secondary text-karaoke-bg'
                : 'bg-karaoke-surface text-karaoke-text-muted border border-karaoke-border'
            }`}
          >
            SONGBOOK
          </button>
        </div>

        {/* Queue Section */}
        {activeTab === 'queue' && (
          <section className="bg-gradient-to-br from-karaoke-surface to-karaoke-surface-light border border-karaoke-border rounded-xl p-6 transition-all hover:border-karaoke-primary hover:shadow-[0_0_20px_var(--color-karaoke-primary-glow)]">
            {state.queue.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-karaoke-text-muted text-lg">
                  Queue is empty
                </p>
                <p className="text-karaoke-text-muted text-sm mt-2">
                  Search for songs to add them
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.queue.map((song, index) => (
                  <div
                    key={`${song.videoId}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-karaoke-surface-light border border-karaoke-border"
                  >
                    <span className="font-display text-2xl text-karaoke-accent w-8 text-center">
                      {index + 1}
                    </span>
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="w-16 h-10 object-cover rounded"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-karaoke-text truncate text-sm">
                        {song.title}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded bg-karaoke-surface border border-karaoke-border text-karaoke-text-muted hover:text-karaoke-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === state.queue.length - 1}
                        className="p-2 rounded bg-karaoke-surface border border-karaoke-border text-karaoke-text-muted hover:text-karaoke-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeFromQueue(index)}
                        className="p-2 rounded bg-karaoke-surface border border-karaoke-border text-karaoke-danger hover:border-karaoke-danger transition-all"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Songbook Section */}
        {activeTab === 'songbook' && (
          <section className="bg-gradient-to-br from-karaoke-surface to-karaoke-surface-light border border-karaoke-border rounded-xl p-6 transition-all hover:border-karaoke-primary hover:shadow-[0_0_20px_var(--color-karaoke-primary-glow)]">
            <div className="relative h-96 overflow-hidden">
              <div className="animate-auto-scroll space-y-2 [animation-play-state:running] hover:[animation-play-state:paused]">
                {/* Curated list */}
                {state.curatedList.map((song, index) => (
                  <div
                    key={`curated-${song.videoId}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-karaoke-surface-light border border-karaoke-border"
                  >
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="w-16 h-10 object-cover rounded"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-karaoke-text truncate text-sm">
                        {song.title}
                      </p>
                      <p className="text-karaoke-text-muted text-xs">
                        Curated
                      </p>
                    </div>
                    <button
                      onClick={() => addToQueue(song)}
                      disabled={isAdding === song.videoId}
                      className="bg-gradient-to-br from-karaoke-primary to-[#ff6b9d] text-white font-display tracking-[2px] border-none rounded-lg py-3 px-6 text-sm cursor-pointer transition-all uppercase hover:scale-105 hover:shadow-[0_0_30px_var(--color-karaoke-primary-glow)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding === song.videoId ? 'ADDING...' : 'ADD'}
                    </button>
                  </div>
                ))}

                {/* History */}
                {state.history.length > 0 && (
                  <>
                    <div className="py-4">
                      <h3 className="font-display text-xl text-karaoke-accent tracking-wider">
                        RECENTLY PLAYED
                      </h3>
                    </div>
                    {state.history.map((song, index) => (
                      <div
                        key={`history-${song.videoId}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-karaoke-surface-light border border-karaoke-border opacity-70"
                      >
                        <img
                          src={song.thumbnail}
                          alt=""
                          className="w-16 h-10 object-cover rounded"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-karaoke-text truncate text-sm">
                            {song.title}
                          </p>
                          <p className="text-karaoke-text-muted text-xs">
                            Played
                          </p>
                        </div>
                        <button
                          onClick={() => addToQueue(song)}
                          disabled={isAdding === song.videoId}
                          className="bg-gradient-to-br from-karaoke-secondary to-[#00b8d4] text-white font-display tracking-[2px] border-none rounded-lg py-3 px-6 text-sm cursor-pointer transition-all uppercase hover:scale-105 hover:shadow-[0_0_30px_var(--color-karaoke-secondary-glow)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAdding === song.videoId ? 'ADDING...' : 'ADD'}
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Duplicate for seamless scroll */}
                {state.curatedList.map((song, index) => (
                  <div
                    key={`curated-dup-${song.videoId}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-karaoke-surface-light border border-karaoke-border"
                  >
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="w-16 h-10 object-cover rounded"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-karaoke-text truncate text-sm">
                        {song.title}
                      </p>
                      <p className="text-karaoke-text-muted text-xs">
                        Curated
                      </p>
                    </div>
                    <button
                      onClick={() => addToQueue(song)}
                      disabled={isAdding === song.videoId}
                      className="bg-gradient-to-br from-karaoke-primary to-[#ff6b9d] text-white font-display tracking-[2px] border-none rounded-lg py-3 px-6 text-sm cursor-pointer transition-all uppercase hover:scale-105 hover:shadow-[0_0_30px_var(--color-karaoke-primary-glow)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding === song.videoId ? 'ADDING...' : 'ADD'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Fade overlays */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-karaoke-surface to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-karaoke-surface to-transparent pointer-events-none" />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
