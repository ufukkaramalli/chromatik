<template>
  <v-navigation-drawer
    class="primary darken-3"
    app
    v-model="drawer"
  >
    <v-list density="compact" nav>
      <v-list-item
        v-for="(it, i) in items"
        :key="i"
        :to="it.to"
        :title="it.title"
        :prepend-icon="it.icon"
        :exact="true"
        link
      />
    </v-list>

    <template #append>
      <div class="pa-2">
        <v-divider class="mb-2" v-if="authenticated" />
        <v-btn
          v-if="authenticated"
          block
          variant="text"
          :to="{ name: 'Settings' }"
          prepend-icon="mdi-cog"
        >
          Settings
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const app = useAppStore()
const auth = useAuthStore()

// Drawer state → store.themeOpts.navigation
const drawer = computed({
  get: () => app.themeOpts.navigation,
  set: (val) => (app.themeOpts.navigation = val),
})

const authenticated = computed(() => auth.authenticated)

const items = computed(() => {
  return authenticated.value
    ? [
        { title: 'Home', icon: 'mdi-home', to: { name: 'Home' } },
        { title: 'Dashboard', icon: 'mdi-view-dashboard', to: { name: 'Dashboard' } },
        { title: 'Tracks', icon: 'mdi-music', to: { name: 'Tracks' } },
        { title: 'Soundkits', icon: 'mdi-folder-music', to: { name: 'Soundkits' } },
      ]
    : [
        { title: 'Home', icon: 'mdi-home', to: { name: 'Home' } },
        { title: 'Login', icon: 'mdi-login', to: { name: 'Login' } },
        { title: 'Register', icon: 'mdi-account-plus', to: { name: 'Register' } },
      ]
})
</script>