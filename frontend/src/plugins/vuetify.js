// src/plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  blueprint: md3,
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#D32F2F',
          secondary: '#424242',
          accent: '#000000',
          error: '#FF5252',
        },
      },
      dark: {
        colors: {
          primary: '#D32F2F',
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
    theme: 'dark',
  })
}

export default vuetify