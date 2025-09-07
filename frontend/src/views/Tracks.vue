<template>
  <v-main>
    <v-container>
      <v-row v-if="authenticated">
        <!-- Kullanıcıda track varsa -->
        <template v-if="tracks && tracks.length > 0">
          <v-col cols="12" class="secondary darken-2 rounded-lg">
            <Playlist
              :tracks="tracks"
              :title="$t('user.headers.MyTracks')"
              v-on="$listeners"
            />
          </v-col>
        </template>

        <!-- Track yoksa -->
        <template v-else>
          <v-col
            cols="12"
            md="8"
            class="secondary darken-2 rounded-lg text-center"
            offset="0"
            offset-md="2"
          >
            <h1
              v-resize-text="{
                ratio: 1.3,
                minFontSize: '14px',
                maxFontSize: '30px',
                delay: 200
              }"
            >
              NO TRACKS ADDED
            </h1>
            <v-divider class="my-3"></v-divider>
            <v-btn>
              <v-icon left dark>mdi-plus</v-icon>
              Add New Track
            </v-btn>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import Playlist from '@/components/Playlist.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    Playlist
  },
  computed: {
    ...mapGetters({
      User: 'auth/user',
      authenticated: 'auth/authenticated'
    }),
    tracks() {
      return this.User?.tracks || []
    }
  }
}
</script>