<template>
  <div class="profile-hero position-relative d-flex align-center pt-16 pb-16 overflow-hidden">
    <!-- Aggressive Wavy Left Background -->
    <div class="profile-hero-waves position-absolute">
      <PillarField v-if="profile.profileTheme === 'pillars'" />
      <FlowField v-else-if="profile.profileTheme === 'flowfield'" />
      <WaveField v-else />
    </div>

    <!-- The sharp container using the profile photo as background -->
    <div
      class="profile-hero-bg position-absolute"
      :style="{ backgroundImage: `url(${profile.photoUrl || '/no-photo-user.jpg'})` }"
    >
      <div class="profile-hero-overlay w-100 h-100"></div>
    </div>

    <v-container class="position-relative z-1 px-6 px-md-12 pt-6">
      <v-row align="center">
        <v-col cols="12" md="8" lg="6" class="text-left">
          <div class="hero-content-box py-6 pr-6 rounded-e-xl">
            <GlitchTitle
              :text="profile.name"
              tag="h1"
              class-name="text-h2 font-weight-black text-high-emphasis mb-2 profile-title text-uppercase"
              :theme="profile.profileTheme"
            />
            <!-- Bio -->
            <p v-if="profile.bio" class="text-body-1 text-medium-emphasis mb-4 profile-bio">
              {{ profile.bio }}
            </p>
            <!-- Meta Info -->
            <div class="text-subtitle-1 text-medium-emphasis mb-8 d-flex align-center flex-wrap profile-meta" style="gap: 24px;">
              <span v-if="profile.location" class="d-flex align-center">
                <v-icon size="small" class="mr-2 text-primary">mdi-map-marker</v-icon>{{ profile.location }}
              </span>
              <span v-if="profile.createdAt" class="d-flex align-center">
                <v-icon size="small" class="mr-2 text-primary">mdi-calendar</v-icon>{{ $t('Profile.Joined') }} {{ new Date(profile.createdAt).getFullYear() }}
              </span>
            </div>

            <!-- Social Links -->
            <div v-if="profile.socialLinks" class="d-flex mb-8" style="gap: 16px;">
              <v-btn v-if="profile.socialLinks.instagram" icon variant="tonal" :href="profile.socialLinks.instagram" target="_blank" class="social-btn">
                <v-icon>mdi-instagram</v-icon>
              </v-btn>
              <v-btn v-if="profile.socialLinks.twitter" icon variant="tonal" :href="profile.socialLinks.twitter" target="_blank" class="social-btn">
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
              <v-btn v-if="profile.socialLinks.youtube" icon variant="tonal" :href="profile.socialLinks.youtube" target="_blank" class="social-btn">
                <v-icon>mdi-youtube</v-icon>
              </v-btn>
              <v-btn v-if="profile.socialLinks.soundcloud" icon variant="tonal" :href="profile.socialLinks.soundcloud" target="_blank" class="social-btn">
                <v-icon>mdi-soundcloud</v-icon>
              </v-btn>
            </div>

            <!-- Follow & Message Buttons -->
            <div class="d-flex flex-wrap" style="gap: 24px;">
              <v-btn color="primary" rounded="pill" size="large" class="px-8 font-weight-bold elevation-8 letter-spacing-1">
                <v-icon class="mr-3">mdi-account-plus</v-icon>
                {{ $t('Profile.Follow') }}
              </v-btn>
              <v-btn variant="outlined" rounded="pill" size="large" class="px-8 font-weight-bold glass-btn letter-spacing-1">
                <v-icon class="mr-3">mdi-message-text</v-icon>
                {{ $t('Profile.Message') }}
              </v-btn>
            </div>

            <!-- Profile Highlights / Stats Badges -->
            <div class="profile-stats-strip mt-6 d-inline-flex align-center flex-wrap">
              <!-- Followers -->
              <div class="stat-badge d-flex align-center">
                <div class="stat-icon-wrap mr-3">
                  <v-icon size="20" color="primary">mdi-account-group</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value font-weight-black text-high-emphasis">{{ formattedFollowers }}</div>
                  <div class="stat-label text-caption text-uppercase text-medium-emphasis">{{ $t('Profile.Followers') }}</div>
                </div>
              </div>

              <div class="stat-divider"></div>

              <!-- Total Plays -->
              <div class="stat-badge d-flex align-center">
                <div class="stat-icon-wrap mr-3">
                  <v-icon size="20" color="primary">mdi-headphones</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value font-weight-black text-high-emphasis">{{ formattedTotalPlays }}</div>
                  <div class="stat-label text-caption text-uppercase text-medium-emphasis">{{ $t('Profile.TotalPlays') }}</div>
                </div>
              </div>

              <div class="stat-divider"></div>

              <!-- Total Content / Releases -->
              <div class="stat-badge d-flex align-center">
                <div class="stat-icon-wrap mr-3">
                  <v-icon size="20" color="primary">mdi-disc</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value font-weight-black text-high-emphasis">{{ formattedTotalReleases }}</div>
                  <div class="stat-label text-caption text-uppercase text-medium-emphasis">{{ $t('Profile.Releases') }}</div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import GlitchTitle from '@/components/GlitchTitle.vue'
import WaveField from '@/components/Visualizers/WaveField.vue'
import FlowField from '@/components/Visualizers/FlowField.vue'
import PillarField from '@/components/Visualizers/PillarField.vue'
import type { UserProfile } from '@/composables/profile/useProfile'

defineProps<{
  profile: UserProfile
  formattedFollowers: string
  formattedTotalPlays: string
  formattedTotalReleases: string
}>()
</script>

<style scoped lang="scss" src="./ProfileHero.scss"></style>
