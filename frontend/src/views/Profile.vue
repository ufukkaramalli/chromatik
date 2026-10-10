<template>
  <v-main class="bg-black profile-page" v-cloak>
    <div v-if="loading" class="d-flex align-center justify-center fill-height">
      <v-progress-circular size="64" width="6" color="primary" indeterminate></v-progress-circular>
    </div>

    <div v-else-if="!profile" class="d-flex flex-column align-center justify-center fill-height opacity-50">
      <v-icon size="80" color="grey" class="mb-4">mdi-account-off</v-icon>
      <h2 class="text-h4 font-weight-black text-white">{{ $t('Profile.NotFound') }}</h2>
    </div>

    <div v-else>
      <!-- Hero Banner -->
      <div class="profile-hero position-relative d-flex align-center pt-16 pb-16 overflow-hidden">
        
        <!-- Aggressive Wavy Left Background -->
        <div class="profile-hero-waves position-absolute">
          <PillarField v-if="profile.profileTheme === 'pillars'" />
          <FlowField v-else-if="profile.profileTheme === 'flowfield'" />
          <WaveField v-else />
        </div>

        <!-- The sharp container using the profile photo as background -->
        <div class="profile-hero-bg position-absolute" :style="{ backgroundImage: `url(${profile.photoUrl || '/no-photo-user.jpg'})` }">
          <div class="profile-hero-overlay w-100 h-100"></div>
        </div>

        <v-container class="position-relative z-1 px-6 px-md-12 pt-6">
          <v-row align="center">
            <v-col cols="12" md="8" lg="6" class="text-left">
              <div class="hero-content-box py-6 pr-6 rounded-e-xl">
                <GlitchTitle 
                  :text="profile.name" 
                  tag="h1" 
                  className="text-h2 font-weight-black text-white mb-2 profile-title text-uppercase" 
                  :theme="profile.profileTheme" 
                />
                <!-- Bio -->
                <p class="text-body-1 text-white-70 mb-4 profile-bio" v-if="profile.bio">
                  {{ profile.bio }}
                </p>
                <!-- Meta Info -->
                <div class="text-subtitle-1 text-grey-lighten-3 mb-8 d-flex align-center flex-wrap profile-meta" style="gap: 24px;">
                  <span v-if="profile.location" class="d-flex align-center">
                    <v-icon size="small" class="mr-2 text-primary">mdi-map-marker</v-icon>{{ profile.location }}
                  </span>
                  <span v-if="profile.createdAt" class="d-flex align-center">
                    <v-icon size="small" class="mr-2 text-primary">mdi-calendar</v-icon>{{ $t('Profile.Joined') }} {{ new Date(profile.createdAt).getFullYear() }}
                  </span>
                </div>
                
                <!-- Social Links -->
                <div class="d-flex mb-8" style="gap: 16px;" v-if="profile.socialLinks">
                  <v-btn v-if="profile.socialLinks.instagram" icon variant="flat" color="white-10" :href="profile.socialLinks.instagram" target="_blank" class="social-btn">
                    <v-icon color="white">mdi-instagram</v-icon>
                  </v-btn>
                  <v-btn v-if="profile.socialLinks.twitter" icon variant="flat" color="white-10" :href="profile.socialLinks.twitter" target="_blank" class="social-btn">
                    <v-icon color="white">mdi-twitter</v-icon>
                  </v-btn>
                  <v-btn v-if="profile.socialLinks.youtube" icon variant="flat" color="white-10" :href="profile.socialLinks.youtube" target="_blank" class="social-btn">
                    <v-icon color="white">mdi-youtube</v-icon>
                  </v-btn>
                  <v-btn v-if="profile.socialLinks.soundcloud" icon variant="flat" color="white-10" :href="profile.socialLinks.soundcloud" target="_blank" class="social-btn">
                    <v-icon color="white">mdi-soundcloud</v-icon>
                  </v-btn>
                </div>
                <!-- Follow & Message Buttons -->
                <div class="d-flex flex-wrap" style="gap: 24px;">
                  <v-btn color="primary" rounded="pill" size="large" class="px-8 font-weight-bold elevation-8 letter-spacing-1">
                    <v-icon class="mr-3">mdi-account-plus</v-icon>
                    {{ $t('Profile.Follow') }}
                  </v-btn>
                  <v-btn color="white" variant="outlined" rounded="pill" size="large" class="px-8 font-weight-bold glass-btn letter-spacing-1">
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
                      <div class="stat-value font-weight-black text-white">{{ formattedFollowers }}</div>
                      <div class="stat-label text-caption text-uppercase text-grey-lighten-1">{{ $t('Profile.Followers') }}</div>
                    </div>
                  </div>

                  <div class="stat-divider"></div>

                  <!-- Total Plays -->
                  <div class="stat-badge d-flex align-center">
                    <div class="stat-icon-wrap mr-3">
                      <v-icon size="20" color="primary">mdi-headphones</v-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value font-weight-black text-white">{{ formattedTotalPlays }}</div>
                      <div class="stat-label text-caption text-uppercase text-grey-lighten-1">{{ $t('Profile.TotalPlays') }}</div>
                    </div>
                  </div>

                  <div class="stat-divider"></div>

                  <!-- Total Content / Releases -->
                  <div class="stat-badge d-flex align-center">
                    <div class="stat-icon-wrap mr-3">
                      <v-icon size="20" color="primary">mdi-disc</v-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value font-weight-black text-white">{{ formattedTotalReleases }}</div>
                      <div class="stat-label text-caption text-uppercase text-grey-lighten-1">{{ $t('Profile.Releases') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Main Content Container -->
      <v-container class="mt-4 content-container px-6 px-md-12">
        <v-row>
          <v-col cols="12">
            <v-tabs 
              v-model="activeTab" 
              color="primary" 
              bg-color="transparent" 
              class="mb-6 font-weight-bold border-b border-white-10"
              slider-color="primary"
            >
              <v-tab value="tracks" class="text-none text-subtitle-1 px-8" rounded="0">
                <v-icon start class="mr-2">mdi-album</v-icon>
                {{ $t('Profile.Tracks') }}
                <v-chip size="x-small" color="white" variant="outlined" class="ml-2 font-weight-black">{{ profile.tracks?.length || 0 }}</v-chip>
              </v-tab>
              <v-tab value="soundkits" class="text-none text-subtitle-1 px-8" rounded="0">
                <v-icon start class="mr-2">mdi-folder-music</v-icon>
                {{ $t('Profile.Soundkits') }}
                <v-chip size="x-small" color="white" variant="outlined" class="ml-2 font-weight-black">{{ profile.soundkits?.length || 0 }}</v-chip>
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="bg-transparent overflow-visible">
              
              <!-- TRACKS TAB -->
              <v-window-item value="tracks">
                <v-row v-if="formattedTracks && formattedTracks.length > 0">
                  <v-col cols="12" sm="6" md="4" lg="2" v-for="(track, idx) in formattedTracks" :key="getTrackId(track)" class="profile-card-col">
                    <BoxPlayer 
                      :track="track" 
                      :theme="profile.profileTheme" 
                      :track-list="formattedTracks" 
                      :index="idx" 
                    />
                  </v-col>
                </v-row>
                <div v-else class="text-center py-12 opacity-50">
                  <v-icon size="64" color="grey" class="mb-4">mdi-music-off</v-icon>
                  <div class="text-h6 font-weight-medium">{{ $t('Profile.NoTracks') }}</div>
                </div>
              </v-window-item>

              <!-- SOUNDKITS TAB -->
              <v-window-item value="soundkits">
                <v-row v-if="profile.soundkits && profile.soundkits.length > 0">
                  <v-col cols="12" sm="6" md="4" lg="3" v-for="kit in profile.soundkits" :key="kit._id" class="profile-card-col">
                    <v-card class="glass-card rounded-xl elevation-8 h-100 position-relative track-card hover-card overflow-hidden">
                      <div class="track-image-wrapper">
                        <v-img :src="kit.thumbnailUrl || '/no-photo.jpg'" height="200" cover class="align-end" draggable="false">
                          <div class="track-play-overlay d-flex align-center justify-center">
                            <v-btn icon color="primary" size="large" elevation="8">
                              <v-icon size="x-large">mdi-download</v-icon>
                            </v-btn>
                          </div>
                        </v-img>
                        <div class="price-tag kit-tag px-3 py-1 font-weight-black">
                          ${{ kit.price || '0' }}
                        </div>
                      </div>
                      <v-card-text class="pa-4 text-center">
                        <div class="text-h6 font-weight-black text-white text-truncate mb-1">{{ kit.title }}</div>
                        <div class="text-caption text-grey-lighten-1 text-truncate">{{ kit.description || 'Soundkit' }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <div v-else class="text-center py-12 opacity-50">
                  <v-icon size="64" color="grey" class="mb-4">mdi-folder-hidden</v-icon>
                  <div class="text-h6 font-weight-medium">{{ $t('Profile.NoSoundkits') }}</div>
                </div>
              </v-window-item>
            </v-window>

          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-main>
</template>

<script setup>
import BoxPlayer from '@/components/Audio/BoxPlayer.vue'
import FlowField from '@/components/FlowField.vue'
import GlitchTitle from '@/components/GlitchTitle.vue'
import PillarField from '@/components/PillarField.vue'
import WaveField from '@/components/WaveField.vue'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getTrackId } from '@/utils/track'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const profile = ref(null)
const activeTab = ref('tracks')

const formattedTracks = computed(() => {
  if (!profile.value?.tracks) return []
  return profile.value.tracks.map((track) => ({
    ...track,
    id: getTrackId(track),
    user: track.user || {
      _id: profile.value._id,
      name: profile.value.name,
      slug: profile.value.slug
    }
  }))
})

const formatStatNumber = (num) => {
  if (num == null || isNaN(num)) return '0'
  const val = Number(num)
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (val >= 10000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return new Intl.NumberFormat().format(val)
}

const formattedFollowers = computed(() => {
  const count = profile.value?.followersCount ?? profile.value?.followers?.length ?? 0
  return formatStatNumber(count)
})

const formattedTotalPlays = computed(() => {
  if (!profile.value?.tracks?.length) return '0'
  const total = profile.value.tracks.reduce((sum, track) => sum + (Number(track.views) || 0), 0)
  return formatStatNumber(total)
})

const formattedTotalReleases = computed(() => {
  const tracksCount = profile.value?.tracks?.length || 0
  const soundkitsCount = profile.value?.soundkits?.length || 0
  return formatStatNumber(tracksCount + soundkitsCount)
})

const fetchProfile = async () => {
  try {
    loading.value = true
    const slug = route.params.userSlug
    const response = await axios.get(`/api/user/profile/${slug}`)
    if (response.data.profile) {
      profile.value = response.data.profile
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
}
.profile-hero {
  min-height: 480px;
  background: #050508; /* Very dark base */
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

/* Aggressive Wavy Background on the Left (Abstract Sine Waves) */
.profile-hero-waves {
  top: 0;
  left: 0;
  height: 100%;
  width: 65%;
  overflow: hidden;

  /* Fade out smoothly from left to right (soldan sağa kararacak) */
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0) 100%);
  z-index: 0;
}

/* Background shape containing the photo (Mirrored to Right) */
.profile-hero-bg {
  top: 0;
  right: 0;
  left: auto;
  height: 100%;
  width: 100%;
  max-width: 900px; /* Covers right portion of screen */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  /* Fade out towards the LEFT */
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
  
  /* Sharp shape via clip-path (slanted on the left edge) */
  clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%);
}

/* Dark gradient overlay (fades from left to right to blend with black background) */
.profile-hero-overlay {
  background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%);
}

.profile-title {
  letter-spacing: -1px;
  /* Tight dark edge + wide soft glow for separation from the animated background */
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.65),
    0 6px 24px rgba(0, 0, 0, 0.55),
    0 0 48px rgba(0, 0, 0, 0.4);
}

.hero-content-box {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding-right: 120px !important; /* gives that little extra length */
  max-width: 100%;
}

.hero-content-box::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  /* Stretch all the way to the left past the screen edge */
  width: 100vw;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: -1;
  /* The subtle inner gradient overlay */
  background-image: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
  /* Fade out smoothly over the extra padding on the right */
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 100px), transparent 100%);
  mask-image: linear-gradient(to right, black calc(100% - 100px), transparent 100%);
}

.profile-meta {
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 3px 14px rgba(0, 0, 0, 0.6);
}

.profile-meta .v-icon {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8));
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.bg-white-10 {
  background-color: rgba(255,255,255,0.1) !important;
}

.social-btn {
  transition: all 0.3s ease;
}
.social-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.8) !important;
  transform: translateY(-2px);
}
.profile-bio {
  max-width: 600px;
  line-height: 1.6;
}
.glass-card {
  background: rgba(20, 20, 25, 0.6) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.profile-card-col {
  position: relative;
  z-index: 1;
  transition: z-index 0.2s;

  &:hover,
  &:focus-within {
    z-index: 10;
  }
}

.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 15px rgba(var(--v-theme-primary), 0.2) !important;
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  z-index: 10;
}
.track-image-wrapper {
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;

  :deep(img) {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }
}
.track-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}
.hover-card:hover .track-play-overlay {
  opacity: 1;
}
.price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(var(--v-theme-primary), 0.9);
  color: white;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  font-size: 0.9rem;
}
.kit-tag {
  background: rgba(255, 255, 255, 0.9);
  color: black;
}

/* Profile Highlights / Stats Badges */
.profile-stats-strip {
  background: rgba(18, 18, 24, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 8px 18px;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.profile-stats-strip:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-2px);
}

.stat-badge {
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px rgba(var(--v-theme-primary), 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-badge:hover .stat-icon-wrap {
  transform: scale(1.08);
  box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.4);
}

.stat-value {
  font-size: 1.15rem;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.stat-label {
  font-size: 0.68rem !important;
  letter-spacing: 0.08em;
  opacity: 0.75;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.15), transparent);
}

@media (max-width: 600px) {
  .profile-stats-strip {
    width: 100%;
    justify-content: space-around;
    gap: 8px;
    padding: 8px 10px;
  }
  .stat-divider {
    display: none;
  }
}
</style>
