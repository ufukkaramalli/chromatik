/**
 * Mirrors backend `interfaces/health.interface.ts` and
 * `interfaces/serviceAvailability.interface.ts`.
 */
export type ServiceStatus = 'up' | 'down' | 'degraded'
export type OverallHealthStatus = 'operational' | 'degraded' | 'outage'

export interface ServiceCheck {
  status: ServiceStatus
  message?: string
  [key: string]: unknown
}

export interface StorageDiskInfo {
  totalFormatted: string
  freeFormatted: string
  usedFormatted: string
  percentUsed: number
  [key: string]: unknown
}

export interface StorageCheck extends ServiceCheck {
  path?: string
  usedFormatted?: string
  disk?: StorageDiskInfo
}

export interface HealthMemory {
  rssMb: number
  heapUsedMb: number
  heapTotalMb: number
}

export interface HealthResponse {
  status: OverallHealthStatus
  timestamp: string
  uptimeSeconds: number
  services: {
    api: ServiceCheck
    database: ServiceCheck
    storage: StorageCheck
    memory?: HealthMemory
  }
}

/** Error code the backend returns (HTTP 503) while the database is unreachable. */
export const DB_UNAVAILABLE_CODE = 'DB_UNAVAILABLE'
