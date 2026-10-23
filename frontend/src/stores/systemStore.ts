import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { HealthResponse } from '@/types/health'

export type BackendStatus = 'unknown' | 'online' | 'degraded' | 'offline'
export type ConnectionNotice = 'writeFailed' | 'restored' | null

/** Minimum gap between two "write failed" notices so bursts show only one. */
const NOTICE_DEDUPE_MS = 5000

/**
 * Single source of truth for backend / database availability.
 * Written by `lib/backendGate.ts`, read by the footer status chip and
 * the global ConnectionSnackbar. Intentionally does NOT import the axios
 * instance to avoid a circular dependency with the interceptors.
 */
export const useSystemStore = defineStore('system', () => {
  const health = ref<HealthResponse | null>(null)
  const lastCheckedAt = ref<string | null>(null)
  const checking = ref(false)

  const notice = ref<ConnectionNotice>(null)
  const noticeVisible = ref(false)
  let lastWriteNoticeAt = 0
  /** True after a connection problem was surfaced to the user, until it recovers. */
  let issueSurfaced = false

  const isDatabaseReady = computed(() => {
    const status = health.value?.services?.database?.status
    return status === 'up' || status === 'degraded'
  })

  const backendStatus = computed<BackendStatus>(() => {
    if (!health.value) return 'unknown'
    if (health.value.status === 'operational') return 'online'
    if (health.value.status === 'degraded') return 'degraded'
    return 'offline'
  })

  function setHealth(data: HealthResponse) {
    const wasReady = isDatabaseReady.value
    health.value = data
    lastCheckedAt.value = new Date().toISOString()

    if (!wasReady && isDatabaseReady.value && issueSurfaced) {
      issueSurfaced = false
      showNotice('restored')
    }
  }

  /** Backend did not answer at all (process down, network error). */
  function setUnreachable() {
    setHealth({
      status: 'outage',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 0,
      services: {
        api: { status: 'down', message: 'API unreachable' },
        database: { status: 'down', message: 'Connection failed' },
        storage: { status: 'down' }
      }
    })
  }

  /** An API call reported DB_UNAVAILABLE: reflect it immediately without waiting for a health poll. */
  function markDatabaseUnavailable() {
    if (health.value && !isDatabaseReady.value) return
    const base: HealthResponse = health.value ?? {
      status: 'outage',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 0,
      services: {
        api: { status: 'up' },
        database: { status: 'down' },
        storage: { status: 'up' }
      }
    }
    health.value = {
      ...base,
      status: 'outage',
      services: {
        ...base.services,
        database: { ...base.services.database, status: 'down', message: 'Database unavailable' }
      }
    }
  }

  /** A write request failed because of a connection problem. */
  function notifyWriteFailed() {
    issueSurfaced = true
    const now = Date.now()
    if (now - lastWriteNoticeAt < NOTICE_DEDUPE_MS) return
    lastWriteNoticeAt = now
    showNotice('writeFailed')
  }

  function showNotice(kind: Exclude<ConnectionNotice, null>) {
    notice.value = kind
    noticeVisible.value = true
  }

  function dismissNotice() {
    noticeVisible.value = false
  }

  return {
    health,
    lastCheckedAt,
    checking,
    notice,
    noticeVisible,
    isDatabaseReady,
    backendStatus,
    setHealth,
    setUnreachable,
    markDatabaseUnavailable,
    notifyWriteFailed,
    dismissNotice
  }
})
