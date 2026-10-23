<template>
  <v-card class="bg-surface rounded-lg border pa-6 mb-6">
    <h3 class="text-h6 font-weight-bold mb-4">{{ $t('Settings.PublicProfile') }}</h3>
    <v-form ref="formRef" @submit.prevent="$emit('submit')">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="profile.name"
            :label="$t('Settings.Name')"
            variant="outlined"
            bg-color="surface-light"
            :rules="[rules.required]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="profile.slug"
            :label="$t('Settings.Username')"
            variant="outlined"
            bg-color="surface-light"
            :rules="[rules.required, rules.noSpace]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="profile.email"
            :label="$t('Settings.Email')"
            variant="outlined"
            bg-color="surface-light"
            :rules="[rules.required, rules.email]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="profile.language"
            :label="$t('Settings.Language')"
            :items="[
              { title: 'English', value: 'en' },
              { title: 'Türkçe', value: 'tr' }
            ]"
            variant="outlined"
            bg-color="surface-light"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="profile.location"
            :label="$t('Settings.Location')"
            variant="outlined"
            bg-color="surface-light"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="profile.dateOfBirth"
            :label="$t('Settings.DateOfBirth')"
            type="date"
            variant="outlined"
            bg-color="surface-light"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="profile.bio"
            :label="$t('Settings.Bio')"
            variant="outlined"
            bg-color="surface-light"
            rows="3"
          ></v-textarea>
        </v-col>
        <v-col cols="12">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ $t('Settings.ProfileTheme') }}</h4>
          <div class="text-caption text-grey mb-3">{{ $t('Settings.ProfileThemeHint') }}</div>
          <v-btn-toggle v-model="profile.profileTheme" mandatory divided color="primary" variant="outlined" class="rounded-lg">
            <v-btn value="ribbons" class="text-none px-6">
              <v-icon start>mdi-sine-wave</v-icon>
              {{ $t('Settings.ThemeRibbons') }}
            </v-btn>
            <v-btn value="flowfield" class="text-none px-6">
              <v-icon start>mdi-view-grid-outline</v-icon>
              {{ $t('Settings.ThemeFlowField') }}
            </v-btn>
            <v-btn value="pillars" class="text-none px-6">
              <v-icon start>mdi-pillar</v-icon>
              {{ $t('Settings.ThemePillars') }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12">
          <h4 class="text-subtitle-1 font-weight-bold mt-2 mb-2">{{ $t('Settings.SocialMedia') }}</h4>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profile.socialLinks.instagram"
                :label="$t('Settings.Instagram')"
                prepend-inner-icon="mdi-instagram"
                variant="outlined"
                bg-color="surface-light"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profile.socialLinks.twitter"
                :label="$t('Settings.Twitter')"
                prepend-inner-icon="mdi-twitter"
                variant="outlined"
                bg-color="surface-light"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profile.socialLinks.youtube"
                :label="$t('Settings.YouTube')"
                prepend-inner-icon="mdi-youtube"
                variant="outlined"
                bg-color="surface-light"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profile.socialLinks.soundcloud"
                :label="$t('Settings.SoundCloud')"
                prepend-inner-icon="mdi-soundcloud"
                variant="outlined"
                bg-color="surface-light"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <div class="text-right mt-4">
        <v-btn 
          type="submit" 
          color="primary" 
          variant="flat" 
          class="rounded-pill px-8 text-none"
          :loading="updatingProfile"
        >
          {{ $t('Settings.SaveProfile') }}
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProfileFormState } from '@/composables/settings/useSettings'

const props = defineProps<{
  profile: ProfileFormState
  rules: Record<string, (v: any) => true | string>
  updatingProfile: boolean
}>()

defineEmits<{
  (e: 'submit'): void
}>()

const formRef = ref<any>(null)

defineExpose({
  validate: () => formRef.value?.validate()
})
</script>
