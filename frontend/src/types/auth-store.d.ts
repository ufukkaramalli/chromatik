// Minimal typings for the JS auth store (src/stores/auth.js) so TS files can import it
// without TS7016. Only the commonly used surface is typed; everything else stays loose.
declare module '@/stores/auth' {
  export interface AuthUser {
    _id: string
    slug: string
    name?: string
    [key: string]: any
  }

  export interface AuthStore {
    token: string | null
    user: AuthUser | null
    readonly authenticated: boolean
    [key: string]: any
  }

  export const useAuthStore: () => AuthStore
}
