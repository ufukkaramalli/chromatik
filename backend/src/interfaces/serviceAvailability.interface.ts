/**
 * Shared error code returned when the database is not reachable.
 * The frontend relies on this exact string to decide whether a request
 * should be held and retried once the backend becomes ready again.
 */
export const DB_UNAVAILABLE_CODE = 'DB_UNAVAILABLE';

/** Seconds a client should wait before retrying (sent via Retry-After). */
export const DB_UNAVAILABLE_RETRY_AFTER_SECONDS = 3;

export interface IServiceUnavailableResponse {
  status: 503;
  code: typeof DB_UNAVAILABLE_CODE;
  message: string;
  retryAfter: number;
}
