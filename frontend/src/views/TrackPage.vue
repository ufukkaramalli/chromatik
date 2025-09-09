<template>
  <v-main>
    <!-- Yükleme tamamlandığında -->
    <v-container v-if="!loading">
      <!-- Başarılıysa -->
      <template v-if="success">
        <v-row>
          <v-col cols="12" md="3" class="pa-8">
            <v-img
              aspect-ratio="1"
              width="100%"
              height="100%"
              :src="track.art"
              class="elevation-4"
              cover
            />
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

      <!-- Başarısızsa -->
      <template v-else>
        <v-row>
          <v-col cols="12">
            404 Not Found
          </v-col>
        </v-row>
      </template>
    </v-container>

    <!-- Loading -->
    <v-container fluid v-else class="fill-height">
      <v-row class="fill-height">
        <v-col
          cols="12"
          class="d-flex align-center justify-center display-2 text-uppercase py-0 mt-1"
        >
          <v-progress-circular
            :size="60"
            :width="6"
            color="primary"
            indeterminate
          />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTrackStore } from '@/stores/track'
import { useAppStore } from '@/stores/app'
import blur from '@/directives/blur'

const route = useRoute()
const trackStore = useTrackStore()
const appStore = useAppStore()

const track = ref({})
const success = ref(false)
const loading = ref(true)

onMounted(async () => {
  await FIND_TRACK()
})

const FIND_TRACK = async () => {
  try {
    const response = await trackStore.GET_TRACK_PAGE(route.params)
    track.value = response.data

    document.title = `${response.data.name} by ${response.data.user.name} | ${appStore.appName}`

    setTimeout(() => {
      success.value = true
      loading.value = false
    }, 500)
  } catch (error) {
    const statusText = error?.response?.statusText || 'Not Found'
    document.title = `Track ${statusText} | ${appStore.appName}`

    setTimeout(() => {
      success.value = false
      loading.value = false
    }, 500)
  }
}
</script>

<script>
export default {
  directives: { blur }
}
</script>