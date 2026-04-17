import { api } from '@/lib/axios'

/**
 * Service responsible for resolving stream URLs for tracks.
 * Decoupled from state management to allow for prefetching and cleaner concerns.
 */
class StreamResolverService {
  private cache: Map<string, string> = new Map()

  /**
   * Resolves the actual stream URL for a given track ID.
   * Caches the result to avoid redundant API calls.
   */
  async resolve(trackId: string): Promise<string> {
    if (this.cache.has(trackId)) {
      return this.cache.get(trackId)!
    }

    try {
      const res = await api.post('/track/stream', { id: trackId })
      if (!res.data) {
        throw new Error('No stream data received')
      }
      // Assuming original logic: the stream URL is base64 encoded by the backend
      const streamUrl = atob(res.data)
      this.cache.set(trackId, streamUrl)
      return streamUrl
    } catch (error) {
      console.error(`[StreamResolver] Failed to resolve stream for track ${trackId}:`, error)
      throw error
    }
  }

  /**
   * Prefetches the stream URL for a track in the background.
   * Useful for crossfade implementations or simply making the 'next' action faster.
   */
  prefetch(trackId: string): void {
    if (!this.cache.has(trackId)) {
      this.resolve(trackId).catch(() => {
        // Silently fail prefetching, actual errors will be caught when explicitly play is clicked
      })
    }
  }

  /**
   * Clears the cache. Can be called when auth state changes or to free memory.
   */
  clearCache(): void {
    this.cache.clear()
  }
}

export const StreamResolver = new StreamResolverService()
