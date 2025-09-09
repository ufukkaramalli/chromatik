<template>
  <v-app-bar
    :clipped-left="display.lgAndUp"
    app
    color="primary"
    v-cloak
  >
    <!-- Left nav button -->
    <v-app-bar-nav-icon @click="setNavigation(themeOpts.navigation)" />

    <!-- Title -->
    <v-toolbar-title class="ml-0 pl-4">
      <span class="hidden-sm-and-down">
        <h2 class="xxix-regular font-weight-regular">{{ appName }}</h2>
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
      <v-btn variant="text" to="/">Home</v-btn>
      <v-divider vertical class="mx-1" />

      <template v-if="authenticated">
        <!-- User menu -->
        <v-menu transition="slide-y-transition">
          <template #activator="{ props }">
            <v-btn variant="text" v-bind="props">
              {{ user.name }}
              <v-avatar class="ml-2" size="32px">
                <v-img :src="user.photo" alt="User" />
              </v-avatar>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click.prevent="">
              <v-list-item-title>Profile</v-list-item-title>
              <v-list-item-action>
                <v-icon>mdi-account-circle</v-icon>
              </v-list-item-action>
            </v-list-item>

            <v-list-item @click.prevent="logOut">
              <v-list-item-title>Logout</v-list-item-title>
              <v-list-item-action>
                <v-icon>mdi-logout-variant</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-btn variant="text" to="/Login">Login</v-btn>
      </template>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const display = useDisplay()
const router = useRouter()

const app = useAppStore()
const auth = useAuthStore()

const { appName, themeOpts } = storeToRefs(app)
const { authenticated, user } = storeToRefs(auth)

const setNavigation = (payload) => app.setNavigation(payload)

const logOut = async () => {
  await auth.logOut()
  router.push({ name: 'Home' }).catch(() => {})
}
</script>

<style scoped>
[v-cloak] { display: none; }
</style>