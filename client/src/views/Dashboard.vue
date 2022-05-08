<template>
<v-main v-cloak>
  <v-container fluid>
    <v-row>
     <v-col cols="12">
       <json-viewer v-if="authenticated" :value="user"></json-viewer>
     </v-col>
    </v-row>
  </v-container>
  </v-main>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Dashboard',
  components: {
  },
  created () {
  },
  methods: {
  },
  computed: {
    ...mapGetters({
      authenticated: 'auth/authenticated',
      user: 'auth/user'
    })
  }
}
</script>
