import { api } from '@/lib/axios'
import { resolveMediaUrl, SERVER_ROOT_URL } from '@/utils/url'

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
  async resolve(trackId: string, trackUrl?: string): Promise<string> {
    if (this.cache.has(trackId)) {
      return this.cache.get(trackId)!
    }

    // If the track already has a direct URL, use it
    if (trackUrl) {
      let finalUrl = trackUrl;
      if (trackUrl.startsWith('/uploads')) {
        finalUrl = resolveMediaUrl(trackUrl);
      }

      // Check if it's an absolute external URL that might require proxying due to CORS
      if (finalUrl.startsWith('http') && !finalUrl.includes(window.location.host) && (!SERVER_ROOT_URL || !finalUrl.includes(SERVER_ROOT_URL))) {
        const proxiedUrl = `${api.defaults.baseURL}/track/proxy-stream?url=${encodeURIComponent(finalUrl)}`
        console.log(`[StreamResolver] Proxying external URL: ${finalUrl} -> ${proxiedUrl}`)
        this.cache.set(trackId, proxiedUrl)
        return proxiedUrl
      }

      this.cache.set(trackId, finalUrl)
      return finalUrl
    }

    // Fallback: should not happen in normal flow
    console.error(`[StreamResolver] No URL provided for track ${trackId}`)
    throw new Error('No stream URL available')
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
