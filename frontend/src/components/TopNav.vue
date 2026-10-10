<template>
  <v-app-bar
    :clipped-left="display.lgAndUp"
    app
    color="primary"
    class="pr-0"
    v-cloak
  >
    <!-- Left nav button -->
    <v-app-bar-nav-icon
      @click="app.themeOpts.navigation = !app.themeOpts.navigation"
    />

    <!-- Title -->
    <v-toolbar-title class="ml-0 pl-4">
      <span class="hidden-sm-and-down">
        <h2 class="xxix-regular font-weight-regular">{{ app.appName }}</h2>
      </span>
    </v-toolbar-title>

    <v-divider vertical class="mx-3" />

    <!-- Search -->
    <v-text-field
      flat
      variant="solo"
      hide-details
      prepend-inner-icon="mdi-magnify"
      label="Search"
      class="hidden-sm-and-down"
    />

    <v-spacer />

    <!-- Right menu -->
    <v-toolbar-items>
      <v-btn rounded="0" variant="text" to="/">HOME</v-btn>
      <v-divider vertical class="mx-1" />

      <!-- Currency Switcher -->
      <v-btn
        rounded="0"
        variant="text"
        :title="`Active: ${currencyStore.activeCurrency}`"
        @click="toggleCurrency"
      >
        <v-icon size="16" class="mr-1" color="white">mdi-cash-multiple</v-icon>
        {{ currencyStore.activeCurrency }}
      </v-btn>

      <v-divider vertical class="mx-1" />

      <!-- Cart Button with Dynamic Badge -->
      <v-btn
        icon
        rounded="0"
        variant="text"
        class="cart-nav-btn mr-1"
        :aria-label="$t('Cart.Title')"
        @click="cartStore.toggleDrawer"
      >
        <v-badge
          :content="cartStore.itemCount"
          :model-value="!cartStore.isEmpty"
          color="black"
          class="cart-badge"
          location="top end"
          offset-x="-4"
          offset-y="-4"
        >
          <v-icon size="22">mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>

      <v-divider vertical class="mx-1" />

      <template v-if="auth.authenticated">
        <!-- User menu -->
        <v-menu transition="slide-y-transition" location="bottom end" :offset="0">
          <template #activator="{ props }">
            <v-btn rounded="0" variant="text" v-bind="props" class="pr-2">
              {{ auth.user?.name }}
              <v-avatar class="ml-2" size="32px" color="grey-darken-4">
                <v-img :src="getApiUrl(auth.user?.photoUrl)" alt="User" />
              </v-avatar>
            </v-btn>
          </template>

          <v-list class="premium-menu rounded-lg py-2" bg-color="#1E1E1E" elevation="8">
            <v-list-item v-if="auth.user?.slug" :to="{ name: 'Profile', params: { userSlug: auth.user.slug } }" class="menu-item mx-2" rounded="lg">
              <template v-slot:prepend>
                <v-icon color="grey-lighten-1" size="20" class="mr-3">mdi-account-circle-outline</v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium text-grey-lighten-1">{{ $t('Navigation.Profile') }}</v-list-item-title>
            </v-list-item>

            <v-list-item :to="{ name: 'Settings' }" class="menu-item mx-2" rounded="lg">
              <template v-slot:prepend>
                <v-icon color="grey-lighten-1" size="20" class="mr-3">mdi-cog-outline</v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium text-grey-lighten-1">{{ $t('Navigation.Settings') }}</v-list-item-title>
            </v-list-item>

            <v-list-item @click.prevent="logOut" class="menu-item mx-2" rounded="lg">
              <template v-slot:prepend>
                <v-icon color="error" size="20" class="mr-3">mdi-logout-variant</v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium text-error">{{ $t('Navigation.Logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-btn rounded="0" variant="text" to="/Login">LOGIN</v-btn>
      </template>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cartStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { resolveMediaUrl } from '@/utils/url'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

const display = useDisplay()
const app = useAppStore()
const auth = useAuthStore()
const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const router = useRouter()

function toggleCurrency() {
  currencyStore.setCurrency(currencyStore.activeCurrency === 'TRY' ? 'USD' : 'TRY')
}

// Helper to format backend URLs correctly
const getApiUrl = (path) => resolveMediaUrl(path, auth.user?.slug || auth.user?.name || 'user')

const logOut = async () => {
  await auth.logOut()
  router.push({ name: 'Home' }).catch(() => {})
}
</script>

<style scoped>
[v-cloak] { display: none; }

.premium-menu {
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
  min-width: 200px;
}

.menu-item {
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.border-white-10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.cart-badge .v-badge__badge) {
  min-width: 16px !important;
  height: 16px !important;
  font-size: 0.65rem !important;
  font-weight: 800 !important;
  padding: 0 4px !important;
  line-height: 14px !important;
  border-radius: 9999px !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6) !important;
}
</style>