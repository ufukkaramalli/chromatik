<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    class="premium-nav"
    width="280"
    border="none"
  >
    <!-- User Profile Header Section (Only if Authenticated) -->
    <template v-if="authenticated">
      <div class="user-profile-section position-relative pa-6 pt-12 mb-2 d-flex flex-column justify-end" style="min-height: 180px;">
        <div class="profile-bg-image">
          <v-img :src="getApiUrl(user?.photoUrl)" cover class="h-100 w-100"></v-img>
        </div>
        <div class="user-info position-relative z-1 mt-auto">
          <div class="text-h6 font-weight-bold text-white mb-0 text-truncate text-shadow">
            {{ user?.name || 'User' }}
          </div>
          <div class="text-caption text-white-70 text-truncate text-shadow">
            {{ user?.email || 'user@example.com' }}
          </div>
        </div>
      </div>
      <v-divider class="mx-6 mb-4 opacity-10"></v-divider>
    </template>

    <!-- App Logo / Title (If NOT Authenticated) -->
    <template v-else>
      <div class="pa-6 text-center">
        <h1 class="xxix-regular text-h4 text-primary text-shadow mb-0">CHROMATIK</h1>
      </div>
      <v-divider class="mx-6 mb-4 opacity-10"></v-divider>
    </template>

    <!-- Navigation List -->
    <v-list density="comfortable" nav class="px-4">
      <v-list-item
        v-for="(it, i) in items"
        :key="i"
        :to="it.to"
        :prepend-icon="it.icon"
        :active-class="it.activeClass || 'active-nav-item'"
        class="nav-item mb-2"
        rounded="lg"
        :exact="true"
        link
      >
        <v-list-item-title class="font-weight-medium">
          {{ $t(`Navigation.${it.key}`) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- Footer / Append Section -->
    <template #append>
      <div class="pa-4 bg-transparent">
        <v-divider class="mb-4 opacity-10" v-if="authenticated" />
        <v-btn
          v-if="authenticated"
          block
          variant="tonal"
          color="primary"
          class="settings-btn mb-2"
          :to="{ name: 'Settings' }"
          prepend-icon="mdi-cog-outline"
          rounded="lg"
        >
          {{ $t('Navigation.Settings') }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { resolveMediaUrl } from '@/utils/url'

const app = useAppStore()
const auth = useAuthStore()
const { user, authenticated } = storeToRefs(auth)

// Helper to format backend URLs correctly
const getApiUrl = (path) => resolveMediaUrl(path, user.value?.slug || user.value?.name || 'user')

// Drawer state → store.themeOpts.navigation
const drawer = computed({
  get: () => app.themeOpts.navigation,
  set: (val) => (app.themeOpts.navigation = val),
})

const items = computed(() => {
  return authenticated.value
    ? [
        { key: 'Home', icon: 'mdi-home-outline', to: { name: 'Home' } },
        { key: 'Explore', icon: 'mdi-compass-outline', to: { name: 'Explore' } },
        { key: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'Dashboard' } },
        { key: 'Tracks', icon: 'mdi-music-note-outline', to: { name: 'Tracks' } },
        { key: 'Soundkits', icon: 'mdi-folder-music-outline', to: { name: 'Soundkits' } },
      ]
    : [
        { key: 'Home', icon: 'mdi-home-outline', to: { name: 'Home' } },
        { key: 'Explore', icon: 'mdi-compass-outline', to: { name: 'Explore' } },
        { key: 'Login', icon: 'mdi-login-variant', to: { name: 'Login' } },
        { key: 'Register', icon: 'mdi-account-plus-outline', to: { name: 'Register' } },
      ]
})
</script>

<style scoped lang="scss">
.premium-nav {
  background: rgba(var(--v-glass-bg, var(--v-theme-surface)), var(--v-glass-opacity, 0.85)) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08)) !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, var(--v-shadow-strength, 0.15)) !important;
}

.user-profile-section {
  transition: all 0.3s ease;
}

.profile-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  /* Fade the bottom part of the image to transparent so text is legible against the dark nav background */
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);
}

.nav-item {
  color: rgba(var(--v-theme-on-surface), 0.72) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.06) !important;
    color: rgba(var(--v-theme-on-surface), 1) !important;
    transform: translateX(4px);
  }

  &.active-nav-item {
    background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.15), transparent) !important;
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: bold;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 15%;
      height: 70%;
      width: 4px;
      background-color: rgb(var(--v-theme-primary));
      border-radius: 0 4px 4px 0;
      box-shadow: 2px 0 10px rgba(var(--v-theme-primary), 0.5);
    }
    
    .v-icon {
      color: rgb(var(--v-theme-primary)) !important;
    }
  }
}

.settings-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.08));

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.12) !important;
    border-color: rgba(var(--v-theme-primary), 0.35);
  }
}

.text-shadow {
  text-shadow: 0 2px 10px rgba(211, 47, 47, 0.3);
}

.opacity-10 {
  opacity: 0.1;
}

:deep(.v-list-item__spacer) {
  width: 20px !important;
}
</style>