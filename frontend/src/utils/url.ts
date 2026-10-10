/**
 * Centralized URL & Media Resolver
 * Provides environment-driven API and asset URL resolution without hardcoded ports.
 */

/** Base API address from environment, defaults to '/api' for Vite reverse proxy. */
export const API_BASE_URL: string = import.meta.env.VITE_API_ADDRESS || '/api'

/** Server root address without trailing '/api' (useful for /uploads, /docs etc.) */
export const SERVER_ROOT_URL: string = API_BASE_URL.replace(/\/api\/?$/, '')

/**
 * Resolves media or avatar URLs safely and consistently.
 * - Null/empty or 'no-photo-user.jpg' returns a procedural DiceBear avatar.
 * - Absolute HTTP/HTTPS URLs are preserved.
 * - Relative paths (e.g. '/uploads/...') are prefixed with SERVER_ROOT_URL.
 */
export function resolveMediaUrl(path?: string | null, seedFallback: string = 'user'): string {
  if (!path || path === 'no-photo-user.jpg') {
    const seed = seedFallback || 'user'
    return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SERVER_ROOT_URL}${normalizedPath}`
}
