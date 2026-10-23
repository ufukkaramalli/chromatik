<template>
  <v-footer
    color="#0b0810"
    class="app-footer d-block position-relative overflow-hidden"
    :style="footerOffsetStyle"
  >
    <div class="footer-ambient-glow" aria-hidden="true"></div>

    <v-container class="position-relative z-1 pt-8 pb-6 px-3 px-sm-6" style="max-width: 1480px;">
      <!-- Top laser seam (inside the container so it aligns with content and its glow isn't clipped) -->
      <LaserDivider
        icon="mdi-waveform"
        :icon-size="16"
        container-class="mb-10"
        opacity="25"
      />

      <v-row>
        <!-- Brand column -->
        <v-col cols="12" lg="4" class="mb-4 mb-lg-0">
          <router-link :to="{ name: 'Home' }" class="text-decoration-none">
            <span class="xxix-regular text-h4 text-primary">CHROMATIK</span>
          </router-link>

          <p class="text-body-2 text-grey-lighten-1 mt-3 mb-5" style="max-width: 380px; line-height: 1.7;">
            {{ $t('Footer.Tagline') }}
          </p>

          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="social in socialLinks"
              :id="`footer-social-${social.key}`"
              :key="social.key"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              icon
              size="small"
              variant="tonal"
              color="grey-lighten-1"
              :aria-label="social.label"
            >
              <v-icon size="18">{{ social.icon }}</v-icon>
              <GlassTooltip :icon="social.icon" :text="social.label" />
            </v-btn>
          </div>
        </v-col>

        <!-- Link columns -->
        <v-col
          v-for="column in linkColumns"
          :key="column.key"
          cols="6"
          sm="3"
          lg="2"
          class="mb-4 mb-lg-0"
        >
          <div class="font-mono text-caption text-primary font-weight-bold text-uppercase tracking-widest mb-3">
            {{ column.title }}
          </div>
          <v-list density="compact" bg-color="transparent" class="pa-0" nav>
            <v-list-item
              v-for="link in column.links"
              :id="`footer-link-${link.id}`"
              :key="link.id"
              :value="link.id"
              :to="link.to"
              :href="link.href"
              :prepend-icon="link.icon"
              rounded="lg"
              class="px-2 text-grey-lighten-1"
              min-height="34"
              exact
            >
              <v-list-item-title class="text-body-2 text-wrap">
                {{ link.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- CTA band -->
      <v-card rounded="xl" border color="#140f1a" class="pa-5 pa-md-6 mt-8" elevation="0">
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4">
          <div>
            <v-chip
              size="x-small"
              variant="tonal"
              color="primary"
              class="font-mono font-weight-bold text-uppercase mb-2"
              prepend-icon="mdi-lightning-bolt"
            >
              {{ $t('Footer.Cta.Badge') }}
            </v-chip>
            <div class="text-subtitle-1 font-weight-bold text-white">
              {{ authenticated ? $t('Footer.Cta.AuthTitle') : $t('Footer.Cta.GuestTitle') }}
            </div>
            <div class="text-body-2 text-grey-lighten-1">
              {{ authenticated ? $t('Footer.Cta.AuthDesc') : $t('Footer.Cta.GuestDesc') }}
            </div>
          </div>
          <v-btn
            id="footer-cta-btn"
            color="primary"
            rounded="pill"
            size="large"
            class="font-mono font-weight-bold text-none flex-shrink-0 px-8"
            :to="authenticated ? { name: 'Dashboard' } : { name: 'Register' }"
            :prepend-icon="authenticated ? 'mdi-upload' : 'mdi-account-plus-outline'"
          >
            {{ authenticated ? $t('Footer.Cta.AuthButton') : $t('Footer.Cta.GuestButton') }}
          </v-btn>
        </div>
      </v-card>

      <v-divider class="my-6 border-opacity-25" />

      <!-- Bottom bar -->
      <div class="d-flex flex-column flex-lg-row align-center justify-space-between ga-4">
        <div class="font-mono text-caption text-grey text-center text-lg-left">
          © {{ currentYear }} CHROMATIK · {{ $t('Footer.Rights') }}
        </div>

        <!-- Payment badges -->
        <div class="d-flex align-center flex-wrap justify-center ga-2">
          <span class="font-mono text-caption text-grey mr-1">
            <v-icon size="14" class="mr-1">mdi-lock-outline</v-icon>{{ $t('Footer.SecurePayment') }}
          </span>
          <v-chip
            v-for="brand in paymentBrands"
            :key="brand"
            size="small"
            variant="outlined"
            label
            class="font-mono font-weight-black text-grey-lighten-2"
            prepend-icon="mdi-credit-card-outline"
          >
            {{ brand }}
          </v-chip>
          <v-chip
            size="small"
            variant="tonal"
            color="success"
            label
            class="font-mono font-weight-bold"
            prepend-icon="mdi-shield-lock-outline"
          >
            {{ $t('Footer.Ssl') }}
          </v-chip>
        </div>

        <div class="d-flex align-center flex-wrap justify-center ga-2">
          <v-chip
            size="small"
            variant="outlined"
            color="success"
            class="font-mono text-caption"
          >
            <v-badge dot inline color="success" class="mr-2 footer-status-dot" />
            {{ $t('Footer.Status') }}
          </v-chip>
          <v-chip
            size="small"
            variant="outlined"
            class="font-mono text-caption text-grey-lighten-1"
            prepend-icon="mdi-source-branch"
          >
            v{{ appVersion }}
          </v-chip>
        </div>
      </div>
    </v-container>

    <!-- Floating back-to-top button -->
    <v-fab-transition>
      <v-btn
        v-show="showBackToTop"
        id="footer-back-to-top"
        icon
        color="primary"
        elevation="8"
        position="fixed"
        :style="backToTopStyle"
        :aria-label="$t('Footer.BackToTop')"
        @click="scrollToTop"
      >
        <v-icon>mdi-arrow-up</v-icon>
        <GlassTooltip location="start" icon="mdi-arrow-up" :text="$t('Footer.BackToTop')" />
      </v-btn>
    </v-fab-transition>
  </v-footer>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useLayout } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LaserDivider from '@/components/LaserDivider.vue'
import { LEGAL_DOCS, SUPPORT_EMAIL } from '@/constants/legal'
import { version as appVersion } from '../../package.json'

const { t } = useI18n()
const auth = useAuthStore()
const { authenticated } = storeToRefs(auth)
const { mainRect } = useLayout()

const currentYear = new Date().getFullYear()
const paymentBrands = ['VISA', 'Mastercard', 'TROY']

/**
 * The footer lives outside each view's <v-main>, so it must mirror the
 * layout offsets itself: side padding for the navigation drawer and bottom
 * padding for the fixed BottomPlayer. The negative top margin cancels the
 * bottom padding v-main already reserves for the player, avoiding a double gap.
 */
const footerOffsetStyle = computed(() => {
  const { left = 0, right = 0, bottom = 0 } = mainRect.value || {}
  return {
    padding: `0 ${right}px ${bottom}px ${left}px`,
    marginTop: bottom ? `-${bottom}px` : undefined
  }
})

// Real profile URLs can be set via env; until then each button points to the platform homepage.
const socialLinks = [
  { key: 'instagram', icon: 'mdi-instagram', label: 'Instagram', href: import.meta.env.VITE_SOCIAL_INSTAGRAM || 'https://www.instagram.com' },
  { key: 'youtube', icon: 'mdi-youtube', label: 'YouTube', href: import.meta.env.VITE_SOCIAL_YOUTUBE || 'https://www.youtube.com' },
  { key: 'x', icon: 'mdi-twitter', label: 'X', href: import.meta.env.VITE_SOCIAL_X || 'https://x.com' },
  { key: 'soundcloud', icon: 'mdi-soundcloud', label: 'SoundCloud', href: import.meta.env.VITE_SOCIAL_SOUNDCLOUD || 'https://soundcloud.com' },
  { key: 'github', icon: 'mdi-github', label: 'GitHub', href: import.meta.env.VITE_SOCIAL_GITHUB || 'https://github.com' }
]

const navLink = (key, icon, to) => ({ id: key.toLowerCase(), label: t(`Navigation.${key}`), icon, to })

const linkColumns = computed(() => {
  const explore = [
    navLink('Home', 'mdi-home-outline', { name: 'Home' }),
    { id: 'explore-tracks', label: t('Explore.Tabs.Tracks'), icon: 'mdi-music-note-outline', to: { name: 'Explore', params: { tab: 'tracks' } } },
    { id: 'explore-producers', label: t('Explore.Tabs.Producers'), icon: 'mdi-account-music-outline', to: { name: 'Explore', params: { tab: 'producers' } } },
    { id: 'explore-soundkits', label: t('Explore.Tabs.Soundkits'), icon: 'mdi-folder-music-outline', to: { name: 'Explore', params: { tab: 'soundkits' } } }
  ]

  const studio = authenticated.value
    ? [
        navLink('Dashboard', 'mdi-view-dashboard-outline', { name: 'Dashboard' }),
        navLink('Settings', 'mdi-cog-outline', { name: 'Settings' })
      ]
    : [
        navLink('Login', 'mdi-login-variant', { name: 'Login' }),
        navLink('Register', 'mdi-account-plus-outline', { name: 'Register' })
      ]

  const help = [
    { id: 'support', label: t('Footer.Help.Support'), icon: 'mdi-lifebuoy', to: { name: 'Support' } },
    SUPPORT_EMAIL
      ? { id: 'contact', label: t('Footer.Help.Contact'), icon: 'mdi-email-outline', href: `mailto:${SUPPORT_EMAIL}` }
      : { id: 'contact', label: t('Footer.Help.Contact'), icon: 'mdi-email-outline', to: { name: 'Support' } },
    { id: 'license-guide', label: t('Footer.Help.LicenseGuide'), icon: 'mdi-book-music-outline', to: { name: 'Legal', params: { doc: 'license' } } }
  ]

  const legal = LEGAL_DOCS.map((doc) => ({
    id: `legal-${doc.slug}`,
    label: t(`Legal.Nav.${doc.key}`),
    icon: doc.icon,
    to: { name: 'Legal', params: { doc: doc.slug } }
  }))

  return [
    { key: 'explore', title: t('Footer.Columns.Explore'), links: explore },
    { key: 'studio', title: t('Footer.Columns.Studio'), links: studio },
    { key: 'help', title: t('Footer.Columns.Help'), links: help },
    { key: 'legal', title: t('Footer.LegalColumn'), links: legal }
  ]
})

// --- Back to top ---
const showBackToTop = ref(false)
const onScroll = () => {
  showBackToTop.value = window.scrollY > 480
}
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const backToTopStyle = computed(() => {
  const { right = 0, bottom = 0 } = mainRect.value || {}
  return {
    right: `${right + 24}px`,
    bottom: `${bottom + 24}px`,
    zIndex: 1000
  }
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style lang="scss" scoped>
.footer-ambient-glow {
  position: absolute;
  bottom: -120px;
  left: 50%;
  width: 640px;
  height: 260px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse, rgba(var(--v-theme-primary), 0.18) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.footer-status-dot {
  animation: footer-pulse 2s ease-in-out infinite;
}

@keyframes footer-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
