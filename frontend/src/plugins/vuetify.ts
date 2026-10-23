// src/plugins/vuetify.ts
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null
const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark'

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#D32F2F',
          secondary: '#475569',
          accent: '#1E293B',
          background: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-light': '#F1F5F9',
          'surface-variant': '#E2E8F0',
          'on-background': '#0F172A',
          'on-surface': '#1E293B',
          'on-surface-variant': '#64748B',
          'on-primary': '#FFFFFF',
          error: '#EF4444',
          info: '#0EA5E9',
          success: '#10B981',
          warning: '#F59E0B'
        },
        variables: {
          'glass-bg': '255, 255, 255',
          'glass-opacity': 0.85,
          'glass-border-opacity': 0.08,
          'overlay-scrim': '15, 23, 42',
          'shadow-strength': 0.08,
          'glow-strength': 0.10,
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#D32F2F',
          secondary: '#94A3B8',
          accent: '#F8FAFC',
          background: '#09070F',
          surface: '#13111C',
          'surface-light': '#1C1929',
          'surface-variant': '#262238',
          'on-background': '#F8FAFC',
          'on-surface': '#E2E8F0',
          'on-surface-variant': '#94A3B8',
          'on-primary': '#FFFFFF',
          error: '#FF5252',
          info: '#38BDF8',
          success: '#34D399',
          warning: '#FBBF24'
        },
        variables: {
          'glass-bg': '19, 17, 28',
          'glass-opacity': 0.6,
          'glass-border-opacity': 0.08,
          'overlay-scrim': '0, 0, 0',
          'shadow-strength': 0.5,
          'glow-strength': 0.18,
        },
      },
    },
  },
  // IMPORTANT: Use font-based Material Design Icons (mdi-*)
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

// Simple init log to verify icon set
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('[Vuetify:init]', {
    defaultSet: 'mdi',
    iconSets: ['mdi'],
    hasMdiFont: !!document?.fonts,
    theme: initialTheme,
  })
}

export default vuetify
