import { createI18n } from 'vue-i18n'

// Vite için import.meta.glob kullanıyoruz
const files = import.meta.glob<{ default: Record<string, any> }>('./locales/*.json', { eager: true })
const messages: Record<string, any> = {}

for (const [path, mod] of Object.entries(files)) {
  const locale = path.split('/').pop()?.replace('.json', '')
  if (locale && mod.default) {
    messages[locale] = mod.default
  }
}

const currentLocale =
  (typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null) ||
  (import.meta.env.VITE_I18N_LOCALE as string) ||
  'en'

if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLocale
}

export const i18n = createI18n({
  legacy: false,
  locale: currentLocale,
  fallbackLocale: (import.meta.env.VITE_I18N_FALLBACK_LOCALE as string) || 'en',
  messages: messages as any
})
