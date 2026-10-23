<template>
  <v-main class="profile-page">
    <div v-if="loading" class="d-flex align-center justify-center fill-height">
      <v-progress-circular size="64" width="6" color="primary" indeterminate></v-progress-circular>
    </div>

    <div v-else-if="!profile" class="d-flex flex-column align-center justify-center fill-height opacity-50">
      <v-icon size="80" color="grey" class="mb-4">mdi-account-off</v-icon>
      <h2 class="text-h4 font-weight-black text-high-emphasis">{{ $t('Profile.NotFound') }}</h2>
    </div>

    <div v-else>
      <!-- Hero Banner -->
      <ProfileHero
        :profile="profile"
        :formatted-followers="formattedFollowers"
        :formatted-total-plays="formattedTotalPlays"
        :formatted-total-releases="formattedTotalReleases"
      />

      <!-- Main Content Container -->
      <v-container class="mt-4 content-container px-6 px-md-12" style="max-width: 1480px;">
        <v-row>
          <v-col cols="12">
            <v-tabs 
              v-model="activeTab" 
              color="primary" 
              bg-color="transparent" 
              class="mb-6 font-weight-bold border-b ck-border-subtle"
              slider-color="primary"
            >
              <v-tab value="tracks" class="text-none text-subtitle-1 px-8" rounded="0">
                <v-icon start class="mr-2">mdi-album</v-icon>
                {{ $t('Profile.Tracks') }}
                <v-chip size="x-small" variant="outlined" class="ml-2 font-weight-black">{{ profile.tracks?.length || 0 }}</v-chip>
              </v-tab>
              <v-tab value="soundkits" class="text-none text-subtitle-1 px-8" rounded="0">
                <v-icon start class="mr-2">mdi-folder-music</v-icon>
                {{ $t('Profile.Soundkits') }}
                <v-chip size="x-small" variant="outlined" class="ml-2 font-weight-black">{{ profile.soundkits?.length || 0 }}</v-chip>
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="bg-transparent overflow-visible">
              <!-- TRACKS TAB -->
              <v-window-item value="tracks">
                <ProfileTracksTab
                  :tracks="formattedTracks"
                  :theme="profile.profileTheme"
                />
              </v-window-item>

              <!-- SOUNDKITS TAB -->
              <v-window-item value="soundkits">
                <ProfileSoundkitsTab
                  :soundkits="profile.soundkits || []"
                />
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-main>
</template>

<script setup lang="ts">
import { useProfile } from '@/composables/profile/useProfile'
import ProfileHero from '@/components/Profile/ProfileHero.vue'
import ProfileTracksTab from '@/components/Profile/ProfileTracksTab.vue'
import ProfileSoundkitsTab from '@/components/Profile/ProfileSoundkitsTab.vue'

const {
  loading,
  profile,
  activeTab,
  formattedTracks,
  formattedFollowers,
  formattedTotalPlays,
  formattedTotalReleases
} = useProfile()
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
}
</style>
