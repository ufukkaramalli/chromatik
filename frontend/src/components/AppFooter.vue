<template>
  <v-footer
    color="surface"
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

          <p class="text-body-2 text-medium-emphasis mt-3 mb-5" style="max-width: 380px; line-height: 1.7;">
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
              color="medium-emphasis"
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
              class="px-2 text-medium-emphasis"
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
      <v-card rounded="xl" border color="surface-light" class="pa-5 pa-md-6 mt-8" elevation="0">
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
            <div class="text-subtitle-1 font-weight-bold text-high-emphasis">
              {{ authenticated ? $t('Footer.Cta.AuthTitle') : $t('Footer.Cta.GuestTitle') }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
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
            class="font-mono font-weight-black text-medium-emphasis"
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
            id="footer-system-status-chip"
            size="small"
            variant="outlined"
            :color="statusColor"
            class="font-mono text-caption cursor-pointer"
            @click="healthDialogOpen = true"
          >
            <v-badge dot inline :color="statusColor" class="mr-2 footer-status-dot" />
            {{ statusLabel }}
            <GlassTooltip location="top">
              <div class="d-flex flex-column ga-1 text-left">
                <span class="font-weight-bold">{{ statusLabel }}</span>
                <span v-if="dbLatency !== null" class="text-caption text-medium-emphasis">
                  MongoDB: {{ dbLatency }}ms • {{ $t('Footer.ServiceUptime') }}: {{ uptimeFormatted }}
                </span>
                <span v-if="storageUsed" class="text-caption text-medium-emphasis">
                  {{ $t('Footer.ServiceStorage') }}: <strong class="text-white">{{ storageUsed }}</strong>
                  <span v-if="storageDiskFree" class="text-grey-lighten-1"> ({{ storageDiskFree }} {{ $t('Footer.StorageFree') }})</span>
                </span>
                <span class="text-caption text-primary font-weight-bold">
                  {{ $t('Footer.ClickForDetails') }}
                </span>
              </div>
            </GlassTooltip>
          </v-chip>
          <v-chip
            size="small"
            variant="outlined"
            class="font-mono text-caption text-medium-emphasis"
            prepend-icon="mdi-source-branch"
          >
            v{{ appVersion }}
          </v-chip>
        </div>
      </div>
    </v-container>

    <!-- System Health & Status Dialog -->
    <v-dialog v-model="healthDialogOpen" max-width="540">
      <v-card
        rounded="xl"
        border
        color="surface"
        elevation="24"
        class="pa-6"
      >
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-3">
            <v-avatar size="38" :color="statusColor" variant="tonal">
              <v-icon size="20">
                {{ statusColor === 'success' ? 'mdi-check-circle' : statusColor === 'warning' ? 'mdi-alert-circle' : 'mdi-close-circle' }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black text-high-emphasis">
                {{ $t('Footer.SystemHealth') }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ $t('Footer.SystemHealthDesc') }}
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            density="comfortable"
            color="medium-emphasis"
            @click="healthDialogOpen = false"
          />
        </div>

        <v-divider class="mb-4 border-opacity-25" />

        <!-- Services status list -->
        <div class="d-flex flex-column ga-3">
          <!-- API Engine -->
          <v-sheet
            rounded="lg"
            border
            color="surface-light"
            class="pa-3 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" size="22">mdi-server</v-icon>
              <div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ $t('Footer.ServiceApi') }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Node.js {{ health?.services?.api?.nodeVersion || '' }} • {{ $t('Footer.ServiceUptime') }}: {{ uptimeFormatted }}
                </div>
              </div>
            </div>
            <v-chip
              size="x-small"
              variant="tonal"
              :color="health?.services?.api?.status === 'up' ? 'success' : 'error'"
              class="font-mono text-uppercase font-weight-bold"
            >
              {{ health?.services?.api?.status === 'up' ? 'ONLINE' : 'OFFLINE' }}
            </v-chip>
          </v-sheet>

          <!-- MongoDB Database -->
          <v-sheet
            rounded="lg"
            border
            color="surface-light"
            class="pa-3 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center ga-3">
              <v-icon color="success" size="22">mdi-database-check</v-icon>
              <div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ $t('Footer.ServiceDb') }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('Footer.Latency') }}: <strong class="text-high-emphasis">{{ dbLatency !== null ? `${dbLatency} ms` : '—' }}</strong> • State: {{ health?.services?.database?.state || 'connected' }}
                </div>
              </div>
            </div>
            <v-chip
              size="x-small"
              variant="tonal"
              :color="health?.services?.database?.status === 'up' ? 'success' : health?.services?.database?.status === 'degraded' ? 'warning' : 'error'"
              class="font-mono text-uppercase font-weight-bold"
            >
              {{ health?.services?.database?.status === 'up' ? 'HEALTHY' : health?.services?.database?.status === 'degraded' ? 'SLOW' : 'DOWN' }}
            </v-chip>
          </v-sheet>

          <!-- Storage -->
          <v-sheet
            rounded="lg"
            border
            color="surface-light"
            class="pa-3 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center ga-3">
              <v-icon color="secondary" size="22">mdi-folder-music</v-icon>
              <div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ $t('Footer.ServiceStorage') }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  <span>{{ $t('Footer.StorageUsed') }}: <strong class="text-high-emphasis">{{ health?.services?.storage?.usedFormatted || '—' }}</strong></span>
                  <span v-if="health?.services?.storage?.disk?.freeFormatted">
                    • {{ health.services.storage.disk.freeFormatted }} {{ $t('Footer.StorageFree') }} ({{ health.services.storage.disk.totalFormatted }} {{ $t('Footer.StorageTotal') }})
                  </span>
                  <div class="text-caption text-grey text-truncate" style="max-width: 320px;">
                    {{ health?.services?.storage?.path || '' }}
                  </div>
                </div>
              </div>
            </div>
            <v-chip
              size="x-small"
              variant="tonal"
              :color="health?.services?.storage?.status === 'up' ? 'secondary' : 'warning'"
              class="font-mono text-uppercase font-weight-bold"
            >
              {{ health?.services?.storage?.usedFormatted || (health?.services?.storage?.status === 'up' ? 'READY' : 'DEGRADED') }}
            </v-chip>
          </v-sheet>

          <!-- Memory Usage -->
          <v-sheet
            v-if="health?.services?.memory"
            rounded="lg"
            border
            color="surface-light"
            class="pa-3 d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center ga-3">
              <v-icon color="info" size="22">mdi-memory</v-icon>
              <div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ $t('Footer.ServiceMemory') }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Heap: {{ health.services.memory.heapUsedMb }} MB / {{ health.services.memory.heapTotalMb }} MB (RSS: {{ health.services.memory.rssMb }} MB)
                </div>
              </div>
            </div>
            <v-chip
              size="x-small"
              variant="tonal"
              color="info"
              class="font-mono font-weight-bold"
            >
              {{ health.services.memory.heapUsedMb }} MB
            </v-chip>
          </v-sheet>
        </div>

        <div class="d-flex align-center justify-space-between mt-6">
          <span class="font-mono text-caption text-grey">
            {{ health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '' }}
          </span>
          <div class="d-flex ga-2">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              rounded="pill"
              class="text-none font-weight-bold px-4"
              :loading="healthLoading"
              prepend-icon="mdi-refresh"
              @click="fetchHealth"
            >
              {{ $t('Footer.RefreshCheck') }}
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              rounded="pill"
              class="text-none font-weight-bold px-4"
              @click="healthDialogOpen = false"
            >
              {{ $t('Footer.Close') }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

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
import { api } from '@/lib/axios'
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

// --- System Health Check ---
const health = ref(null)
const healthLoading = ref(false)
const healthDialogOpen = ref(false)
let healthInterval = null

const fetchHealth = async () => {
  healthLoading.value = true
  try {
    const { data } = await api.get('/health')
    health.value = data
  } catch (err) {
    health.value = {
      status: 'outage',
      timestamp: new Date().toISOString(),
      uptimeSeconds: 0,
      services: {
        api: { status: 'down', message: 'API unreachable' },
        database: { status: 'down', message: 'Connection failed' },
        storage: { status: 'down' }
      }
    }
  } finally {
    healthLoading.value = false
  }
}

const statusColor = computed(() => {
  if (!health.value) return 'grey'
  if (health.value.status === 'operational') return 'success'
  if (health.value.status === 'degraded') return 'warning'
  return 'error'
})

const statusLabel = computed(() => {
  if (!health.value) return t('Footer.StatusChecking')
  if (health.value.status === 'operational') return t('Footer.StatusOperational')
  if (health.value.status === 'degraded') return t('Footer.StatusDegraded')
  return t('Footer.StatusOutage')
})

const dbLatency = computed(() => {
  return health.value?.services?.database?.latencyMs ?? null
})

const uptimeFormatted = computed(() => {
  const sec = health.value?.uptimeSeconds || 0
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
})

const storageUsed = computed(() => {
  return health.value?.services?.storage?.usedFormatted ?? null
})

const storageDiskFree = computed(() => {
  return health.value?.services?.storage?.disk?.freeFormatted ?? null
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
  fetchHealth()
  healthInterval = setInterval(fetchHealth, 60000)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (healthInterval) clearInterval(healthInterval)
})
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
