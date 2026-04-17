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
      <div class="user-profile-section pa-6 mb-2">
        <v-avatar size="64" class="mb-4 profile-avatar elevation-8" color="primary">
          <v-icon size="32">mdi-account</v-icon>
        </v-avatar>
        <div class="user-info">
          <div class="text-h6 font-weight-bold text-white mb-0 text-truncate">
            {{ user?.name || 'User' }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
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

const app = useAppStore()
const auth = useAuthStore()
const { user, authenticated } = storeToRefs(auth)

// Drawer state → store.themeOpts.navigation
const drawer = computed({
  get: () => app.themeOpts.navigation,
  set: (val) => (app.themeOpts.navigation = val),
})

const items = computed(() => {
  return authenticated.value
    ? [
        { key: 'Home', icon: 'mdi-home-outline', to: { name: 'Home' } },
        { key: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'Dashboard' } },
        { key: 'Tracks', icon: 'mdi-music-note-outline', to: { name: 'Tracks' } },
        { key: 'Soundkits', icon: 'mdi-folder-music-outline', to: { name: 'Soundkits' } },
      ]
    : [
        { key: 'Home', icon: 'mdi-home-outline', to: { name: 'Home' } },
        { key: 'Login', icon: 'mdi-login-variant', to: { name: 'Login' } },
        { key: 'Register', icon: 'mdi-account-plus-outline', to: { name: 'Register' } },
      ]
})
</script>

<style scoped lang="scss">
.premium-nav {
  background: rgba(18, 18, 18, 0.7) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5) !important;
}

.user-profile-section {
  transition: all 0.3s ease;
}

.profile-avatar {
  border: 2px solid rgba(211, 47, 47, 0.3);
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.2), rgba(0, 0, 0, 0.3)) !important;
}

.nav-item {
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
    color: white !important;
    transform: translateX(4px);
  }

  &.active-nav-item {
    background: linear-gradient(90deg, rgba(211, 47, 47, 0.15), transparent) !important;
    color: var(--v-primary-base) !important;
    font-weight: bold;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 15%;
      height: 70%;
      width: 4px;
      background-color: var(--v-primary-base);
      border-radius: 0 4px 4px 0;
      box-shadow: 2px 0 10px rgba(211, 47, 47, 0.5);
    }
    
    .v-icon {
      color: var(--v-primary-base) !important;
    }
  }
}

.settings-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
  background-color: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background-color: rgba(211, 47, 47, 0.1) !important;
    border-color: rgba(211, 47, 47, 0.3);
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