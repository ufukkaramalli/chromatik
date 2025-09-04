<template>
  <v-navigation-drawer
    color="primary darken-3"
    v-model="themeOpts.navigation"
    :clipped="clipped"
    app
  >
    <v-list dense>
      <template v-for="item in items" :key="item.text">
        <template v-if="item.auth">
          <v-list-item
            v-if="authenticated"
            link
            :to="item.route"
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item link :to="item.route">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'

export default {
  name: 'Navigation',
  setup() {
    const store = useStore()
    const display = useDisplay()

    const themeOpts = computed(() => store.state.themeOpts)
    const authenticated = computed(() => store.getters['auth/authenticated'])
    const user = computed(() => store.getters['auth/user'])

    const clipped = computed(() => display.lgAndUp.value)

    const items = [
      { icon: 'mdi-view-dashboard', text: 'Dashboard', auth: true, route: { name: 'Dashboard' } },
      { icon: 'mdi-file-music', text: 'Tracks', auth: true, route: { name: 'Tracks' } },
      { icon: 'mdi-square-wave', text: 'Soundkits', auth: true, route: { name: 'Soundkits' } },
      { icon: 'mdi-message', text: 'Send feedback', auth: false },
      { icon: 'mdi-help-circle', text: 'FAQ', auth: false },
      { icon: 'mdi-cellphone-link', text: 'App downloads', auth: false },
      { icon: 'mdi-cog', text: 'Settings', auth: true, route: { name: 'Settings' } }
    ]

    return {
      themeOpts,
      authenticated,
      user,
      clipped,
      items
    }
  }
}
</script>