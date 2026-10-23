import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/utils/url'
import { waitUntilReady } from '@/lib/backendGate'
import { useSystemStore } from '@/stores/systemStore'
import { DB_UNAVAILABLE_CODE } from '@/types/health'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Opt out of the outage handling entirely (no hold/retry, no global notice). For background calls. */
    skipDbRetry?: boolean
    /** Mark a non-GET request as safe to replay (read-only POST endpoints such as /track/find-track). */
    idempotent?: boolean
  }
}

/** Marker added to rejected errors caused by backend/database unavailability. */
export interface ConnectionAwareError extends AxiosError {
  isConnectionError?: boolean
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
})

// İsteğe token eklemek için interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const RETRYABLE_METHODS = new Set(['get', 'head'])
const GATEWAY_STATUSES = new Set([502, 503, 504])

/**
 * True when the failure means "backend or database temporarily unreachable":
 * no response at all, a gateway error, or our explicit DB_UNAVAILABLE 503.
 */
export function isConnectionError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || axios.isCancel(error)) return false
  if (!error.response) return true
  return GATEWAY_STATUSES.has(error.response.status)
}

function isDbUnavailable(error: AxiosError): boolean {
  const data = error.response?.data as { code?: string } | undefined
  return error.response?.status === 503 && data?.code === DB_UNAVAILABLE_CODE
}

function retryAfterMs(error: AxiosError): number | undefined {
  const seconds = Number(error.response?.headers?.['retry-after'])
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined
}

// 401 yakalayıcı + bağlantı kesintisinde bekletme / yeniden deneme
api.interceptors.response.use(
  (response) => response,
  async (error: ConnectionAwareError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common.Authorization
    }

    const config = error.config as InternalAxiosRequestConfig | undefined
    if (!config || config.skipDbRetry || !isConnectionError(error)) {
      return Promise.reject(error)
    }

    error.isConnectionError = true
    const system = useSystemStore()
    if (isDbUnavailable(error)) system.markDatabaseUnavailable()

    const method = (config.method || 'get').toLowerCase()

    // Idempotent reads: keep the promise pending (skeletons stay visible) and replay once ready.
    if (config.idempotent || RETRYABLE_METHODS.has(method)) {
      await waitUntilReady({
        signal: (config.signal as AbortSignal | undefined) ?? null,
        firstDelayMs: retryAfterMs(error)
      })
      return api.request(config)
    }

    // Writes are never replayed automatically (no duplicate likes / cart items).
    system.notifyWriteFailed()
    // Keep monitoring in the background so the footer chip and "restored" notice update.
    waitUntilReady().catch(() => {})
    return Promise.reject(error)
  }
)