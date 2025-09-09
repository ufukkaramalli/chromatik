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
        <v-divider class="mb-2" />
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
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const auth = useAuthStore()
const app = useAppStore()
const { authenticated } = storeToRefs(auth)
const { themeOpts } = storeToRefs(app)

const drawer = computed({
  get: () => themeOpts.value.navigation,
  set: (v) => app.setNavigation(v)
})

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