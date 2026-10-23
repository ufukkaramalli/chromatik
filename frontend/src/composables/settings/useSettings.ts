import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, type AuthUser } from '@/stores/auth'
import { api, isConnectionError } from '@/lib/axios'
import { resolveMediaUrl } from '@/utils/url'

export interface ProfileFormState {
  name: string
  slug: string
  email: string
  language: string
  location: string
  profileTheme: string
  dateOfBirth: string
  bio: string
  socialLinks: {
    instagram: string
    twitter: string
    youtube: string
    soundcloud: string
  }
}

export interface PasswordFormState {
  new: string
  confirm: string
}

export function useSettings() {
  const { t } = useI18n()
  const auth = useAuthStore()

  // Snackbar state
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
  })

  const showSnackbar = (text: string, color = 'success') => {
    snackbar.value = { show: true, text, color }
  }

  // Helper to format backend URLs correctly
  const getApiUrl = (path?: string) =>
    resolveMediaUrl(path, auth.user?.slug || auth.user?.name || 'user')

  const photoUrl = computed(() => {
    const u = auth.user as Record<string, any> | null
    return (u?.photoUrl as string) || (u?.avatar as string) || ''
  })

  // Forms data
  const profile = reactive<ProfileFormState>({
    name: '',
    slug: '',
    email: '',
    language: 'en',
    location: '',
    profileTheme: 'ribbons',
    dateOfBirth: '',
    bio: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: '',
      soundcloud: ''
    }
  })

  const password = reactive<PasswordFormState>({
    new: '',
    confirm: ''
  })

  const profileForm = ref<any>(null)
  const passwordForm = ref<any>(null)
  const avatarInput = ref<HTMLInputElement | null>(null)

  const updatingProfile = ref(false)
  const updatingPassword = ref(false)
  const uploadingAvatar = ref(false)

  // Validation rules
  const rules = {
    required: (v: any) => !!v || t('Form.required'),
    counterMin: (v: any) => (v || '').length >= 8 || `${t('Form.min')} 8 ${t('Form.character')}`,
    email: (v: any) => {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(v) || t('Form.invalidemail')
    },
    noSpace: (v: any) => (v || '').indexOf(' ') < 0 || t('Form.NoSpaces'),
    passwordMatch: (v: any) => v === password.new || t('Register.errors.cpasswordnotmatch')
  }

  // Load current user data
  onMounted(() => {
    const user = auth.user as Record<string, any> | null
    if (user) {
      profile.name = String(user.name || '')
      profile.slug = String(user.slug || '')
      profile.email = String(user.email || '')
      profile.language = String(user.language || 'en')
      profile.location = String(user.location || '')
      profile.profileTheme = String(user.profileTheme || 'ribbons')
      profile.bio = String(user.bio || '')

      const socialLinks = user.socialLinks as Record<string, string> | undefined
      if (socialLinks) {
        profile.socialLinks.instagram = socialLinks.instagram || ''
        profile.socialLinks.twitter = socialLinks.twitter || ''
        profile.socialLinks.youtube = socialLinks.youtube || ''
        profile.socialLinks.soundcloud = socialLinks.soundcloud || ''
      }

      // Format date string for HTML date input (YYYY-MM-DD)
      if (user.dateOfBirth) {
        try {
          const date = new Date(user.dateOfBirth as string | number | Date)
          profile.dateOfBirth = date.toISOString().split('T')[0]
        } catch {
          profile.dateOfBirth = ''
        }
      } else {
        profile.dateOfBirth = ''
      }
    }
  })

  // Methods
  const updateProfile = async () => {
    if (!profileForm.value) return
    const { valid } = await profileForm.value.validate()
    if (!valid) return

    updatingProfile.value = true
    try {
      await auth.updateSettings(profile)
      showSnackbar(t('Settings.SuccessMsg'))
    } catch (error) {
      if (!isConnectionError(error)) showSnackbar(t('Settings.ErrorMsg'), 'error')
      console.error(error)
    } finally {
      updatingProfile.value = false
    }
  }

  const updatePassword = async () => {
    if (!passwordForm.value) return
    const { valid } = await passwordForm.value.validate()
    if (!valid) return

    updatingPassword.value = true
    try {
      await api.put('/user/settings', { password: password.new })
      showSnackbar(t('Settings.SuccessMsg'))
      passwordForm.value.reset()
    } catch (error) {
      if (!isConnectionError(error)) showSnackbar(t('Settings.ErrorMsg'), 'error')
      console.error(error)
    } finally {
      updatingPassword.value = false
    }
  }

  const onAvatarSelected = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    uploadingAvatar.value = true
    try {
      const { data } = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (auth.user) {
        auth.user = { ...auth.user, photoUrl: data.photoUrl } as AuthUser
      }
      showSnackbar(t('Settings.SuccessMsg'))
    } catch (error) {
      if (!isConnectionError(error)) showSnackbar(t('Settings.ErrorMsg'), 'error')
      console.error(error)
    } finally {
      uploadingAvatar.value = false
      if (avatarInput.value) avatarInput.value.value = ''
    }
  }

  const triggerAvatarInput = () => {
    avatarInput.value?.click()
  }

  return {
    auth,
    authenticated: auth.authenticated,
    user: auth.user,
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
  }
}
