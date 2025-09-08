<template>
  <v-card class="pa-3">
    <v-row no-gutters align="center">
      <v-col cols="auto" class="mr-3">
        <v-img
          :src="current?.art || ''"
          width="56"
          height="56"
          class="rounded"
          cover
        />
      </v-col>

      <v-col>
        <div class="text-truncate font-weight-medium">
          {{ current?.name || '—' }}
        </div>
        <div class="text-truncate text-caption">
          {{ current?.user?.name || '' }}
        </div>

        <v-slider
          class="mt-1"
          :model-value="progress"
          @update:model-value="seek"
          density="compact"
          hide-details
        />
      </v-col>

      <v-col cols="auto" class="ml-3 d-flex align-center">
        <v-btn icon size="small" @click="previous"><v-icon>mdi-skip-previous</v-icon></v-btn>

        <v-btn
          icon
          size="large"
          class="mx-1"
          @click="toggle"
        >
          <v-icon v-if="!playing">mdi-play</v-icon>
          <v-icon v-else>mdi-pause</v-icon>
        </v-btn>

        <v-btn icon size="small" @click="next"><v-icon>mdi-skip-next</v-icon></v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const current = computed(() => store.getters['track/GET_CURRENT_TRACK'])
const audio = computed(() => store.getters['track/GET_AUDIO_ELEMENT'])
const playing = computed(() => store.getters['track/GET_PLAYING'])

const progress = computed(() => {
  const el = audio.value
  if (!el || !el.duration) return 0
  return (el.currentTime / el.duration) * 100
})

const seek = (val) => {
  const el = audio.value
  if (!el || !el.duration) return
  el.currentTime = (val / 100) * el.duration
}

const next = () => store.dispatch('track/SET_NEXT_TRACK')
const previous = () => store.dispatch('track/SET_PREVIOUS_TRACK')

const toggle = () => {
  const el = audio.value
  if (!el) return
  if (playing.value) {
    el.pause()
    store.commit('track/SET_IS_PLAYING', false)
  } else {
    store.dispatch('track/clickedPlay', { trackIndex: null, track: current.value })
  }
}
</script>
