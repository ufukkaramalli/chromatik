<template>
  <v-main v-cloak>
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" class="secondary darken-2 rounded-lg mb-2">
          <Playlist :tracks="GetRecentTracks" v-on="$listeners">
            <template #title>
              <h5>{{$t('players.Recent')}}</h5>
            </template>
            <template #subtitle>
              <h5><small class="caption">{{$t('players.Last24')}}</small></h5>
            </template>
          </Playlist>
        </v-col>
        <v-col cols="12" class="secondary darken-2 rounded-lg mb-2">
          <Playlist :tracks="GetMostLikedTracks" v-on="$listeners">
            <template #title>
              <h5>{{$t('players.MostLiked')}}</h5>
            </template>
            <template #subtitle>
              <h5><small class="caption">{{$t('players.Alltimes')}}</small></h5>
            </template>
          </Playlist>
        </v-col>
        <v-col cols="12" class="secondary darken-2 rounded-lg mb-2">
          <Playlist :tracks="GetMostStreamedTracks" v-on="$listeners">
            <template #title>
              <h5>{{$t('players.MostStreamed')}}</h5>
            </template>
            <template #subtitle>
              <h5><small class="caption">{{$t('players.Alltimes')}}</small></h5>
            </template>
          </Playlist>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
<script>
import Playlist from '@/components/Playlist.vue'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'Home',
  components: {
    Playlist
  },
  data () {
    return {
      Recent: false,
      MostLike: false,
      items: ['Volkswagen', 'Fiat', 'Ford'],
      volkswagenitems: ['Polo', 'Golf'],
      fiatitems: ['500', 'Doblo'],
      brand: '',
      brandmodel: ''
    }
  },
  created () {
    this.RecentTracks()
    this.MostLikedTracks()
    this.MostStreamedTracks()
  },
  methods: {
    ...mapActions({
      RecentTracks: 'RECENT_TRACKS',
      MostLikedTracks: 'MOST_LIKED',
      MostStreamedTracks: 'MOST_STREAMED'
    })
  },
  computed: {
    ...mapGetters({
      GetRecentTracks: 'GET_RECENT_TRACKS',
      GetMostLikedTracks: 'GET_MOST_LIKED_TRACKS',
      GetMostStreamedTracks: 'GET_MOST_STREAMED_TRACKS'
    })
  }
}
</script>
