<template>
<v-navigation-drawer
        color="primary darken-3"
        v-model="themeOpts.navigation"
        :clipped="$vuetify.breakpoint.lgAndUp"
        app
      >
        <v-list dense>
          <template v-for="item in items">
            <template v-if="item.auth">
              <v-list-item
              :key="item.text"
              link
              :to="item.route"
              v-if="authenticated"
            >
              <v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </template>
            <template v-else>
              <v-list-item
              :key="item.text"
              link
              :to="item.route"
            >
              <v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </template>
          </template>
        </v-list>
      </v-navigation-drawer>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data () {
    return {
      items: [
        { icon: 'mdi-view-dashboard', text: 'Dashboard', auth: true, route: { name: 'Dashboard' } },
        { icon: 'mdi-file-music', text: 'Tracks', auth: true, route: { name: 'Tracks' } },
        { icon: 'mdi-square-wave', text: 'Soundkits', auth: true, route: { name: 'Soundkits' } },
        { icon: 'mdi-message', text: 'Send feedback', auth: false },
        { icon: 'mdi-help-circle', text: 'FAQ', auth: false },
        { icon: 'mdi-cellphone-link', text: 'App downloads', auth: false },
        { icon: 'mdi-cog', text: 'Settings', auth: true, route: { name: 'Settings' } }
      ]
    }
  },
  computed: {
    ...mapState(['themeOpts']),
    ...mapGetters({
      authenticated: 'auth/authenticated',
      user: 'auth/user'
    })
  }
}
</script>
