<template>
    <v-app-bar
        :clipped-left="$vuetify.breakpoint.lgAndUp"
        app
        color="primary"
        dark
        v-cloak
      >
        <v-app-bar-nav-icon @click="setNavigation(themeOpts.navigation)"></v-app-bar-nav-icon>
        <v-toolbar-title class="ml-0 pl-4">
          <span class="hidden-sm-and-down"><h2 class="xxix-regular font-weight-regular">{{appName}}</h2>
          </span>
        </v-toolbar-title>
        <v-divider inset vertical class="mx-3"></v-divider>
        <v-text-field
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="Search"
          class="hidden-sm-and-down"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text tile to="/">Home</v-btn>
          <v-divider vertical inset class="mx-1"></v-divider>
          <template v-if="authenticated">
            <v-menu transition="slide-y-transition" offset-y bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn text tile dark v-bind="attrs" v-on="on">
                  {{user.name}}
                  <v-avatar class="ml-2" size="32px" item>
                    <v-img :src="user.photo" alt="Vuetify"></v-img>
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
            <v-btn text tile to="/Login">Login</v-btn>
          </template>
        </v-toolbar-items>
      </v-app-bar>
</template>
<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
export default {
  name: 'TopNav',
  data: () => ({
  }),
  methods: {
    ...mapMutations([
      // `mapMutations` also supports payloads:
      'setTopNav', // map `this.incrementBy(amount)` to `this.$store.commit('incrementBy', amount)`
      'setNavigation',
      'setLoginOverlay'
    ]),
    ...mapActions({
      logOutAction: 'auth/logOut'
    }),
    logOut () {
      this.logOutAction().then(() => {
        this.$router.push({ name: 'Home' }).catch(() => {})
      })
    }
  },
  computed: {
    ...mapState(['themeOpts']),
    ...mapGetters({
      appName: 'getAppName',
      authenticated: 'auth/authenticated',
      user: 'auth/user'
    })
  }
}
</script>
