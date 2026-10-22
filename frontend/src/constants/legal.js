// Single source of truth for legal documents.
// `slug` is the URL segment (/legal/:doc), `key` maps to Legal.Docs.<key> / Legal.Nav.<key> in locales.
export const LEGAL_DOCS = [
  { slug: 'terms', key: 'terms', icon: 'mdi-file-document-outline' },
  { slug: 'privacy', key: 'privacy', icon: 'mdi-shield-account-outline' },
  { slug: 'license', key: 'license', icon: 'mdi-music-box-multiple-outline' },
  { slug: 'cookies', key: 'cookies', icon: 'mdi-cookie-outline' },
  { slug: 'distance-sales', key: 'distanceSales', icon: 'mdi-file-sign' },
  { slug: 'refund', key: 'refund', icon: 'mdi-cash-refund' }
]

// Bump when any legal text changes.
export const LEGAL_LAST_UPDATED = '2026-10-22'

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || ''

export const findLegalDoc = (slug) => LEGAL_DOCS.find((d) => d.slug === slug)
