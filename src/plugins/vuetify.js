import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

Vuetify.config.silent = false

const opts = {
  theme: {
    dark: true,
    themes: {
      light: {
        primary: colors.red.darken3,
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3
      },
      dark: {
        primary: colors.red.darken3
      }
    },
    options: {
      customProperties: true
    }
  }
}

export default new Vuetify(opts)
