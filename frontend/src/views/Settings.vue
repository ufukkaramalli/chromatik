<template>
  <v-main v-if="authenticated">
    <v-container fluid class="py-8 px-6">
      <v-row>
        <v-col cols="12" md="10" lg="8" class="mx-auto">
          <h1 class="text-h4 font-weight-bold mb-6 text-high-emphasis">{{ $t('Settings.Title') }}</h1>

          <v-row>
            <!-- Profile Picture Settings -->
            <v-col cols="12" md="4">
              <SettingsAvatarCard
                :photo-url="photoUrl"
                :uploading-avatar="uploadingAvatar"
                :get-api-url="getApiUrl"
                @upload-click="triggerAvatarInput"
              />
              <input 
                ref="avatarInput" 
                type="file" 
                class="d-none" 
                accept="image/png, image/jpeg" 
                @change="onAvatarSelected"
              >
            </v-col>

            <!-- Profile Info & Password Settings -->
            <v-col cols="12" md="8">
              <!-- General Info Form -->
              <SettingsProfileForm
                ref="profileForm"
                :profile="profile"
                :rules="rules"
                :updating-profile="updatingProfile"
                @submit="updateProfile"
              />

              <!-- Password Form -->
              <SettingsPasswordForm
                ref="passwordForm"
                :password="password"
                :rules="rules"
                :updating-password="updatingPassword"
                @submit="updatePassword"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Snackbar -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top" :timeout="3000" class="mt-4">
        {{ snackbar.text }}
      </v-snackbar>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSettings } from '@/composables/settings/useSettings'
import SettingsAvatarCard from '@/components/Settings/SettingsAvatarCard.vue'
import SettingsProfileForm from '@/components/Settings/SettingsProfileForm.vue'
import SettingsPasswordForm from '@/components/Settings/SettingsPasswordForm.vue'

const {
  authenticated,
  photoUrl,
  snackbar,
  profile,
  password,
  profileForm,
  passwordForm,
  avatarInput,
  updatingProfile,
  updatingPassword,
  uploadingAvatar,
  rules,
  getApiUrl,
  updateProfile,
  updatePassword,
  onAvatarSelected,
  triggerAvatarInput
} = useSettings()
</script>