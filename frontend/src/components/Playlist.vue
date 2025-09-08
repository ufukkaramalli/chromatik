<template>
  <v-card flat color="transparent">
    <v-card-title class="d-flex align-center justify-space-between">
      <div>
        <slot name="title" />
        <slot name="subtitle" />
      </div>
    </v-card-title>

    <v-card-text>
      <v-row dense>
        <v-col
          v-for="(track, idx) in tracks"
          :key="track.id || idx"
          cols="12" sm="6" md="3" lg="2"
        >
          <v-card class="hover-elevate cursor-pointer" @click="go(track)">
            <v-img :src="track.art" aspect-ratio="1" cover />
            <v-card-subtitle class="text-truncate">
              {{ track.user?.name }}
            </v-card-subtitle>
            <v-card-title class="text-truncate">
              {{ track.name }}
            </v-card-title>
            <v-card-actions>
              <v-btn size="small" icon @click.stop="play(track, idx)">
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-spacer />
              <v-btn size="small" icon :to="{ name: 'TrackPage', params: { user: track.user.slug, track: track.name } }" @click.stop>
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const props = defineProps({
  tracks: { type: Array, default: () => [] }
})

const store = useStore()
const router = useRouter()

const play = (track, index) => {
  // Liste bağlamı dışındaki index anlamlı olmayabilir, trackIndex'i null geçebiliriz
  store.dispatch('track/clickedPlay', { trackIndex: index, track })
}

const go = (track) => {
  if (!track?.user?.slug || !track?.name) return
  router.push({ name: 'TrackPage', params: { user: track.user.slug, track: track.name } })
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
