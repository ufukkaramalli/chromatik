<template>
  <v-app-bar
    :clipped-left="display.lgAndUp"
    app
    color="primary"
    v-cloak
  >
    <!-- Sol menü butonu -->
    <v-app-bar-nav-icon @click="setNavigation(themeOpts.navigation)" />

    <!-- Başlık -->
    <v-toolbar-title class="ml-0 pl-4">
      <span class="hidden-sm-and-down">
        <h2 class="xxix-regular font-weight-regular">{{ appName }}</h2>
      </span>
    </v-toolbar-title>

    <v-divider vertical class="mx-3" />

    <!-- Arama alanı -->
    <v-text-field
      flat
      variant="solo"
      hide-details
      prepend-inner-icon="mdi-magnify"
      label="Search"
      class="hidden-sm-and-down"
    />

    <v-spacer />

    <!-- Sağ menü -->
    <v-toolbar-items>
      <v-btn variant="text" to="/">Home</v-btn>
      <v-divider vertical class="mx-1" />

      <template v-if="authenticated">
        <!-- Kullanıcı menüsü -->
        <v-menu transition="slide-y-transition">
          <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props">
              {{ user.name }}
              <v-avatar class="ml-2" size="32px">
                <v-img :src="user.photo" alt="Vuetify" />
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
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const display = useDisplay()
const store = useStore()
const router = useRouter()

// Vuex getters
const appName = computed(() => store.getters['getAppName'])
const authenticated = computed(() => store.getters['auth/authenticated'])
const user = computed(() => store.getters['auth/user'])
const themeOpts = computed(() => store.state.themeOpts)

// Vuex mutations
const setNavigation = (payload) => store.commit('setNavigation', payload)

// Actions
const logOut = async () => {
  await store.dispatch('auth/logOut')
  router.push({ name: 'Home' }).catch(() => {})
}
</script>

<style scoped>
[v-cloak] {
  display: none;
}
</style>