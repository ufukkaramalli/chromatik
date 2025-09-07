<template>
  <v-navigation-drawer
    class="primary darken-3"
    v-model="themeOpts.navigation"
    :clipped="clipped"
    app
  >
    <v-list dense>
      <template v-for="item in items" :key="item.text">
        <v-list-item
          v-if="!item.auth || (item.auth && authenticated)"
          :to="item.route"
          link
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'

const store = useStore()
const display = useDisplay()

const themeOpts = computed(() => store.state.themeOpts)
const authenticated = computed(() => store.getters['auth/authenticated'])
const user = computed(() => store.getters['auth/user'])

// Vuetify 3 uyumlu clipped
const clipped = computed(() => display.lgAndUp)

const items = [
  { icon: 'mdi-view-dashboard', text: 'Dashboard', auth: true, route: { name: 'Dashboard' } },
  { icon: 'mdi-file-music', text: 'Tracks', auth: true, route: { name: 'Tracks' } },
  { icon: 'mdi-square-wave', text: 'Soundkits', auth: true, route: { name: 'Soundkits' } },
  { icon: 'mdi-message', text: 'Send feedback', auth: false },
  { icon: 'mdi-help-circle', text: 'FAQ', auth: false },
  { icon: 'mdi-cellphone-link', text: 'App downloads', auth: false },
  { icon: 'mdi-cog', text: 'Settings', auth: true, route: { name: 'Settings' } }
]
</script>