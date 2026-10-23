import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { api, isConnectionError } from '@/lib/axios'
import { resolveMediaUrl } from '@/utils/url'

export interface ChartDay {
  label: string
  plays: number
  height: number
}

export interface AudienceCountry {
  label: string
  percentage: number
}

export const MOCK_CHART_DATA: ChartDay[] = [
  { label: 'Days.Mon', plays: 120, height: 20 },
  { label: 'Days.Tue', plays: 450, height: 65 },
  { label: 'Days.Wed', plays: 280, height: 40 },
  { label: 'Days.Thu', plays: 800, height: 100 },
  { label: 'Days.Fri', plays: 550, height: 75 },
  { label: 'Days.Sat', plays: 900, height: 95 },
  { label: 'Days.Sun', plays: 340, height: 50 },
]

export const MOCK_AUDIENCE_DATA: AudienceCountry[] = [
  { label: 'Countries.US', percentage: 45 },
  { label: 'Countries.TR', percentage: 30 },
  { label: 'Countries.DE', percentage: 15 },
]

export function useDashboard() {
  const { t, locale } = useI18n()
  const auth = useAuthStore()

  const tracks = ref<any[]>([])
  const soundkits = ref<any[]>([])
  const loading = ref(true)
  const activeTab = ref<'tracks' | 'soundkits'>('tracks')
  const showUploadModal = ref(false)

  const isDeleting = ref<string | null>(null)
  const showDeleteConfirm = ref(false)
  const trackToDelete = ref<string | null>(null)
  const snackbar = ref({ show: false, text: '', color: 'success' })

  // Currency Formatter
  const formatCurrency = (amount: number) => {
    const currency = locale.value === 'tr' ? 'TRY' : 'USD'
    return new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(amount)
  }

  // Computed Stats
  const totalViews = computed(() => tracks.value.reduce((acc, t) => acc + (t.views || 0), 0))
  const totalLikes = computed(() => tracks.value.reduce((acc, t) => acc + (t.likes || 0), 0))

  const showSnackbar = (text: string, color = 'success') => {
    snackbar.value = { show: true, text, color }
  }

  const fetchTracks = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/track/dashboard')
      tracks.value = data.tracks || []
    } catch (error) {
      console.error('Failed to fetch tracks', error)
    } finally {
      loading.value = false
    }
  }

  const confirmDelete = (id: string) => {
    trackToDelete.value = id
    showDeleteConfirm.value = true
  }

  const executeDelete = async () => {
    if (!trackToDelete.value) return
    const id = trackToDelete.value
    isDeleting.value = id

    try {
      await api.delete(`/track/${id}`)
      tracks.value = tracks.value.filter(t => t._id !== id)
      showSnackbar(t('Dashboard.TrackDeletedSuccess'))
    } catch (error) {
      console.error('Failed to delete track', error)
      if (!isConnectionError(error)) showSnackbar(t('Dashboard.TrackDeletedError'), 'error')
    } finally {
      isDeleting.value = null
      showDeleteConfirm.value = false
      trackToDelete.value = null
    }
  }

  const getApiUrl = (path: string) => resolveMediaUrl(path, 'user')

  onMounted(() => {
    fetchTracks()
  })

  return {
    auth,
    tracks,
    soundkits,
    loading,
    activeTab,
    showUploadModal,
    isDeleting,
    showDeleteConfirm,
    trackToDelete,
    snackbar,
    chartData: MOCK_CHART_DATA,
    audienceData: MOCK_AUDIENCE_DATA,
    totalViews,
    totalLikes,
    formatCurrency,
    fetchTracks,
    confirmDelete,
    executeDelete,
    getApiUrl
  }
}
