<template>
    <v-main>
      <v-container v-if="!loading">
        <template v-if="success">
          <v-row>
            <v-col cols="12" md="3" class="pa-8">
               <v-img aspect-ratio="1" :width="'100%'" :height="'100%'" :src="track.art" class="elevation-4" />
            </v-col>
            <v-col cols="12" md="6">
              BURASI
            </v-col>
            <v-col>
              BURASI
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12"></v-col>
          </v-row>
        </template>
        <template v-else>
          <v-row>
            <v-col cols="12">
              404 Not Found
            </v-col>
          </v-row>
        </template>
      </v-container>
      <v-container fluid v-else class="fill-height">
        <v-row class="fill-height">
          <v-col cols="12" class="d-flex align-center justify-center display-2 text-uppercase py-0 mt-1">
            <v-progress-circular
            :size="60"
            :width="6"
            color="primary"
            indeterminate
          ></v-progress-circular>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>
<script>
import blur from '@/directives/blur'
import { mapActions } from 'vuex'
export default {
  directives: {
    blur
  },
  data () {
    return {
      track: {},
      success: false,
      loading: true
    }
  },
  created () {
    this.FIND_TRACK()
  },
  methods: {
    ...mapActions({
      GET_TRACK_PAGE: 'GET_TRACK_PAGE'
    }),
    async FIND_TRACK () {
      await this.GET_TRACK_PAGE(this.$route.params).then(response => {
        this.track = response.data
        document.title = response.data.name + ' by ' + response.data.user.name + ' | Chromatique'
        setTimeout(() => {
          this.success = true
          this.loading = false
        }, 1000)
      }).catch(error => {
        document.title = 'Track ' + error.response.statusText + ' | Chromatique'
        setTimeout(() => {
          this.success = false
          this.loading = false
        }, 1000)
      })
    }
  }
}
</script>
