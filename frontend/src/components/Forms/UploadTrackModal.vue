<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card class="bg-grey-darken-4 text-white">
      <v-card-title class="d-flex justify-space-between align-center pa-4 border-b border-white-10">
        <span class="text-h5 font-weight-bold">{{ $t('UploadTrack.Title') }}</span>
        <v-btn icon="mdi-close" variant="text" @click="close" :disabled="uploading"></v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="submit" v-model="isValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                :label="$t('UploadTrack.TrackName')"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || $t('UploadTrack.TrackNameRequired')]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="formData.bpm"
                :label="$t('UploadTrack.Bpm')"
                type="number"
                step="0.5"
                variant="outlined"
                density="comfortable"
                :loading="isDetectingBpm"
                :placeholder="isDetectingBpm ? $t('UploadTrack.DetectingBpm') : ''"
              >
                <template #prepend-inner v-if="getAudioFile() && !isDetectingBpm">
                  <v-tooltip :text="$t('UploadTrack.DetectBpm')" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        icon="mdi-metronome"
                        variant="text"
                        size="x-small"
                        density="compact"
                        class="text-grey-lighten-1"
                        @click.stop="detectBpm(true)"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </template>

                <template #append-inner v-if="formData.bpm && !isDetectingBpm">
                  <div class="d-flex align-center ga-1">
                    <v-tooltip :text="$t('UploadTrack.HalveBpm')" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="tooltipProps"
                          variant="tonal"
                          size="x-small"
                          density="compact"
                          class="bpm-step-btn font-weight-bold"
                          @click.stop="halveBpm"
                        >
                          ½
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip :text="$t('UploadTrack.DoubleBpm')" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="tooltipProps"
                          variant="tonal"
                          size="x-small"
                          density="compact"
                          class="bpm-step-btn font-weight-bold"
                          @click.stop="doubleBpm"
                        >
                          2x
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="formData.key"
                :items="TRACK_KEYS"
                :label="$t('UploadTrack.Key')"
                :placeholder="$t('UploadTrack.KeyPlaceholder')"
                variant="outlined"
                density="comfortable"
                clearable
                auto-select-first
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="formData.genres"
                :label="$t('UploadTrack.Genres')"
                multiple
                chips
                variant="outlined"
                density="comfortable"
                :placeholder="$t('UploadTrack.GenresPlaceholder')"
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="formData.moods"
                :label="$t('UploadTrack.Moods')"
                multiple
                chips
                variant="outlined"
                density="comfortable"
                :placeholder="$t('UploadTrack.MoodsPlaceholder')"
              ></v-combobox>
            </v-col>
          </v-row>

          <h3 class="text-h6 mt-4 mb-2 text-primary">{{ $t('UploadTrack.MediaFiles') }}</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="files.art"
                :label="$t('UploadTrack.CoverArt')"
                accept="image/*"
                prepend-icon="mdi-image"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || $t('UploadTrack.CoverArtRequired')]"
              ></v-file-input>
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="files.taggedAudio"
                :label="$t('UploadTrack.TaggedAudio')"
                accept="audio/*"
                prepend-icon="mdi-music-note"
                variant="outlined"
                density="comfortable"
              ></v-file-input>
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="files.untaggedAudio"
                :label="$t('UploadTrack.UntaggedAudio')"
                accept="audio/*"
                prepend-icon="mdi-music-box"
                variant="outlined"
                density="comfortable"
              ></v-file-input>
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="files.stems"
                :label="$t('UploadTrack.Stems')"
                accept=".zip"
                prepend-icon="mdi-folder-zip"
                variant="outlined"
                density="comfortable"
              ></v-file-input>
            </v-col>
          </v-row>

          <h3 class="text-h6 mt-4 mb-2 text-primary">{{ $t('UploadTrack.Pricing') }}</h3>
          <v-row>
            <v-col cols="6" md="3">
              <v-text-field v-model="formData.priceBasic" :label="$t('UploadTrack.Basic')" type="number" variant="outlined" density="comfortable" prepend-inner-icon="mdi-currency-usd"></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field v-model="formData.pricePremium" :label="$t('UploadTrack.Premium')" type="number" variant="outlined" density="comfortable" prepend-inner-icon="mdi-currency-usd"></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field v-model="formData.priceUnlimited" :label="$t('UploadTrack.Unlimited')" type="number" variant="outlined" density="comfortable" prepend-inner-icon="mdi-currency-usd"></v-text-field>
            </v-col>
            <v-col cols="6" md="3">
              <v-text-field v-model="formData.priceExclusive" :label="$t('UploadTrack.Exclusive')" type="number" variant="outlined" density="comfortable" prepend-inner-icon="mdi-currency-usd"></v-text-field>
            </v-col>
          </v-row>

          <v-expand-transition>
            <div v-if="uploading" class="mt-4">
              <div class="d-flex justify-space-between mb-1">
                <span>{{ $t('UploadTrack.Uploading') }}</span>
                <span>{{ progress }}%</span>
              </div>
              <v-progress-linear :model-value="progress" color="primary" height="8" rounded></v-progress-linear>
            </div>
          </v-expand-transition>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 border-t border-white-10">
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="close" :disabled="uploading">{{ $t('UploadTrack.Cancel') }}</v-btn>
        <v-btn color="primary" variant="elevated" @click="submit" :loading="uploading" :disabled="!isValid">{{ $t('UploadTrack.UploadBtn') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/lib/axios'
import { TRACK_KEYS } from '@/types/audio'
import { detectBpmFromAudio } from '@/utils/bpmDetector'

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'uploaded'])

const dialog = ref(props.modelValue)

watch(() => props.modelValue, (val) => dialog.value = val)
watch(dialog, (val) => emit('update:modelValue', val))

const form = ref(null)
const isValid = ref(false)
const uploading = ref(false)
const progress = ref(0)
const isDetectingBpm = ref(false)
const detectedBpmVal = ref(null)

const getFile = (f) => (Array.isArray(f) ? f[0] : f)
const getAudioFile = () => getFile(files.untaggedAudio) || getFile(files.taggedAudio) || null

const detectBpm = async (force = false) => {
  const audioFile = getAudioFile()
  if (!audioFile || isDetectingBpm.value) return
  if (!force && formData.bpm) return

  isDetectingBpm.value = true
  try {
    const result = await detectBpmFromAudio(audioFile)
    if (result && result.bpm) {
      formData.bpm = result.bpm
      detectedBpmVal.value = result.bpm
    }
  } catch (err) {
    console.warn('[UploadTrackModal] BPM detection failed:', err)
  } finally {
    isDetectingBpm.value = false
  }
}

const halveBpm = () => {
  const current = Number(formData.bpm)
  if (!current || isNaN(current)) return
  formData.bpm = Math.max(40, Math.round((current / 2) * 2) / 2)
}

const doubleBpm = () => {
  const current = Number(formData.bpm)
  if (!current || isNaN(current)) return
  formData.bpm = Math.min(300, Math.round((current * 2) * 2) / 2)
}

const initialData = {
  name: '', bpm: '', key: null, genres: [], moods: [],
  priceBasic: 29.99, pricePremium: 49.99, priceUnlimited: 99.99, priceExclusive: 499.99
}
const formData = reactive({ ...initialData })

const initialFiles = { art: [], taggedAudio: [], untaggedAudio: [], stems: [] }
const files = reactive({ ...initialFiles })
let lastDetectedFile = null

watch([() => files.untaggedAudio, () => files.taggedAudio], () => {
  const audioFile = getAudioFile()
  if (audioFile && audioFile !== lastDetectedFile) {
    lastDetectedFile = audioFile
    detectBpm(true)
  }
})

const close = () => {
  if (uploading.value) return;
  dialog.value = false;
  resetForm();
}

const resetForm = () => {
  Object.assign(formData, initialData)
  Object.assign(files, initialFiles)
  lastDetectedFile = null
  progress.value = 0;
  isDetectingBpm.value = false;
  detectedBpmVal.value = null;
  if(form.value) form.value.resetValidation();
}

const submit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return;

  uploading.value = true
  progress.value = 0

  const getFile = (f) => Array.isArray(f) ? f[0] : f;
  const hasTagged = !!getFile(files.taggedAudio);
  const hasUntagged = !!getFile(files.untaggedAudio);

  if (!hasTagged && !hasUntagged) {
    alert(t('UploadTrack.AudioRequired'));
    uploading.value = false;
    return;
  }

  const payload = new FormData()
  
  // Backend expects status
  payload.append('status', 'public')

  Object.entries(formData).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      payload.append(key, val.join(','))
    } else if (val !== null && val !== '') {
      payload.append(key, val)
    }
  })

  const artFile = getFile(files.art);
  if (artFile) payload.append('art', artFile);
  
  const taggedFile = getFile(files.taggedAudio);
  if (taggedFile) payload.append('taggedAudio', taggedFile);
  
  const untaggedFile = getFile(files.untaggedAudio);
  if (untaggedFile) payload.append('untaggedAudio', untaggedFile);
  
  const stemsFile = getFile(files.stems);
  if (stemsFile) payload.append('stems', stemsFile);

  try {
    await api.post('/track', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    emit('uploaded')
    uploading.value = false // Deactivate uploading state before closing
    close()
  } catch (error) {
    console.error('Upload failed:', error)
    alert(t('UploadTrack.UploadFailed') + (error.response?.data?.message || error.message))
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.border-white-10 {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.bpm-step-btn {
  min-width: 22px !important;
  height: 22px !important;
  padding: 0 4px !important;
  font-size: 11px !important;
  border-radius: 4px;
  letter-spacing: 0;
}
</style>
