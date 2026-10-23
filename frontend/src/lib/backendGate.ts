import axios from 'axios'
import { API_BASE_URL } from '@/utils/url'
import { useSystemStore } from '@/stores/systemStore'
import type { HealthResponse } from '@/types/health'

/**
 * Backend Gate
 * ------------
 * Holds idempotent requests while the backend / database is unavailable and
 * releases them once `/api/health` reports the database as reachable.
 *
 * - A single poller serves every waiting request (no thundering herd).
 * - Exponential backoff with jitter, capped at MAX_POLL_DELAY_MS.
 * - Polling pauses while the tab is hidden and re-checks immediately when the
 *   tab becomes visible again or the browser comes back online.
 */

/** Maximum time a request may wait for the backend. Infinity = until it recovers. */
export const MAX_WAIT_MS = Number.POSITIVE_INFINITY

const BASE_POLL_DELAY_MS = 1000
const MAX_POLL_DELAY_MS = 10000
const JITTER_RATIO = 0.3

/** Dedicated client without interceptors so health checks never recurse into the gate. */
const healthClient = axios.create({ baseURL: API_BASE_URL, timeout: 8000 })

interface Waiter {
  resolve: () => void
  reject: (reason: unknown) => void
  cleanup: () => void
}

const waiters = new Set<Waiter>()
let pollTimer: ReturnType<typeof setTimeout> | null = null
let pollInFlight = false
let attempt = 0
let listenersBound = false

/**
 * Fetches `/api/health` and writes the result into the system store.
 * 503 responses still carry a valid health payload (overall outage).
 */
export async function checkHealth(): Promise<HealthResponse | null> {
  const store = useSystemStore()
  store.checking = true
  try {
    const { data } = await healthClient.get<HealthResponse>('/health', {
      validateStatus: (status) => status === 200 || status === 503
    })
    store.setHealth(data)
  } catch {
    store.setUnreachable()
  } finally {
    store.checking = false
  }
  return store.health
}

/**
 * Resolves once the database is reachable. Rejects only when `signal` aborts
 * or MAX_WAIT_MS elapses (never, by default).
 */
export function waitUntilReady(options: { signal?: AbortSignal | null; firstDelayMs?: number } = {}): Promise<void> {
  const { signal, firstDelayMs } = options
  bindGlobalListeners()

  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const onAbort = () => {
      waiter.cleanup()
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'))
    }

    const waiter: Waiter = {
      resolve,
      reject,
      cleanup: () => {
        waiters.delete(waiter)
        if (timeoutId) clearTimeout(timeoutId)
        signal?.removeEventListener('abort', onAbort)
        if (waiters.size === 0) stopPolling()
      }
    }

    waiters.add(waiter)
    signal?.addEventListener('abort', onAbort, { once: true })

    if (Number.isFinite(MAX_WAIT_MS)) {
      timeoutId = setTimeout(() => {
        waiter.cleanup()
        reject(new Error('Backend did not become ready in time'))
      }, MAX_WAIT_MS)
    }

    startPolling(firstDelayMs)
  })
}

function startPolling(firstDelayMs?: number) {
  if (pollTimer || pollInFlight) return
  scheduleNextPoll(firstDelayMs ?? BASE_POLL_DELAY_MS)
}

function stopPolling() {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
  attempt = 0
}

function scheduleNextPoll(delayMs: number) {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
  // Paused while hidden; the visibilitychange listener resumes immediately.
  if (typeof document !== 'undefined' && document.hidden) return
  pollTimer = setTimeout(poll, delayMs)
}

async function poll() {
  pollTimer = null
  if (waiters.size === 0 || pollInFlight) return

  pollInFlight = true
  await checkHealth()
  pollInFlight = false

  if (useSystemStore().isDatabaseReady) {
    releaseAll()
    return
  }

  attempt += 1
  const backoff = Math.min(BASE_POLL_DELAY_MS * 2 ** attempt, MAX_POLL_DELAY_MS)
  const jitter = backoff * JITTER_RATIO * Math.random()
  scheduleNextPoll(backoff + jitter)
}

function releaseAll() {
  const pending = Array.from(waiters)
  pending.forEach((waiter) => {
    waiter.cleanup()
    waiter.resolve()
  })
  stopPolling()
}

/** Immediately re-check when the user returns to the tab or the network comes back. */
function resumeNow() {
  if (waiters.size === 0 || pollInFlight) return
  if (typeof document !== 'undefined' && document.hidden) return
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
  void poll()
}

function bindGlobalListeners() {
  if (listenersBound || typeof window === 'undefined') return
  listenersBound = true
  document.addEventListener('visibilitychange', resumeNow)
  window.addEventListener('online', resumeNow)
}
