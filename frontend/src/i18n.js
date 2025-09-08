import { createI18n } from 'vue-i18n'

// Vite için import.meta.glob kullanıyoruz
const files = import.meta.glob('./locales/*.json', { eager: true })
const messages = {}

for (const [path, mod] of Object.entries(files)) {
  const locale = path.split('/').pop().replace('.json', '')
  messages[locale] = mod.default
}

export const i18n = createI18n({
  legacy: false,
  locale: import.meta.env.VITE_I18N_LOCALE || 'en',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  messages
})