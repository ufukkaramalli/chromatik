<template>
  <v-main v-if="authenticated">
    <v-container fluid class="py-8 px-6">
      <v-row>
        <v-col cols="12" md="10" lg="8" class="mx-auto">
          <h1 class="text-h4 font-weight-bold mb-6 text-high-emphasis">{{ $t('Settings.Title') }}</h1>

          <v-row>
            <!-- Profile Picture Settings -->
            <v-col cols="12" md="4">
              <v-card class="bg-surface rounded-lg border text-center py-8 px-4 h-100">
                <h3 class="text-h6 font-weight-bold mb-6">{{ $t('Settings.ProfilePicture') }}</h3>
                <v-avatar size="150" color="surface-light" class="mb-6 elevation-4">
                  <v-img :src="getApiUrl(user?.photoUrl)" cover></v-img>
                </v-avatar>
                
                <div class="d-flex flex-column align-center gap-3">
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="rounded-pill px-6 text-none"
                    @click="$refs.avatarInput.click()"
                    :loading="uploadingAvatar"
                  >
                    <v-icon start>mdi-cloud-upload</v-icon>
                    {{ $t('Settings.UploadNew') }}
                  </v-btn>
                  
                  <input 
                    type="file" 
                    ref="avatarInput" 
                    class="d-none" 
                    accept="image/png, image/jpeg" 
                    @change="onAvatarSelected"
                  >
                </div>
              </v-card>
            </v-col>

            <!-- Profile Info Settings -->
            <v-col cols="12" md="8">
              <!-- General Info Form -->
              <v-card class="bg-surface rounded-lg border pa-6 mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">{{ $t('Settings.PublicProfile') }}</h3>
                <v-form ref="profileForm" @submit.prevent="updateProfile">
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

              <!-- Password Form -->
              <v-card class="bg-surface rounded-lg border pa-6">
                <h3 class="text-h6 font-weight-bold mb-4">{{ $t('Settings.ChangePassword') }}</h3>
                <v-form ref="passwordForm" @submit.prevent="updatePassword">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="password.new"
                        :label="$t('Settings.NewPassword')"
                        type="password"
                        variant="outlined"
                        bg-color="surface-light"
                        :rules="[rules.counterMin]"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="password.confirm"
                        :label="$t('Settings.ConfirmPassword')"
                        type="password"
                        variant="outlined"
                        bg-color="surface-light"
                        :rules="[rules.passwordMatch]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <div class="text-right mt-4">
                    <v-btn 
                      type="submit" 
                      color="primary" 
                      variant="outlined" 
                      class="rounded-pill px-8 text-none"
                      :loading="updatingPassword"
                    >
                      {{ $t('Settings.UpdatePassword') }}
                    </v-btn>
                  </div>
                </v-form>
              </v-card>

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

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/axios'
import { resolveMediaUrl } from '@/utils/url'

const { t } = useI18n()
const auth = useAuthStore()
const { authenticated, user } = auth

// Snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

// Helper to format backend URLs correctly
const getApiUrl = (path) => resolveMediaUrl(path, user?.slug || user?.name || 'user')

// Forms data
const profile = reactive({
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

const password = reactive({
  new: '',
  confirm: ''
})

const profileForm = ref(null)
const passwordForm = ref(null)

const updatingProfile = ref(false)
const updatingPassword = ref(false)
const uploadingAvatar = ref(false)
const avatarInput = ref(null)

// Rules
const rules = {
  required: (v) => !!v || t('Form.required'),
  counterMin: (v) => (v || '').length >= 8 || `${t('Form.min')} 8 ${t('Form.character')}`,
  email: (v) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(v) || t('Form.invalidemail')
  },
  noSpace: (v) => (v || '').indexOf(' ') < 0 || t('Form.NoSpaces'),
  passwordMatch: (v) => v === password.new || t('Register.errors.cpasswordnotmatch')
}

// Load current user data
onMounted(() => {
  if (user) {
    profile.name = user.name || ''
    profile.slug = user.slug || ''
    profile.email = user.email || ''
    profile.language = user.language || 'en'
    profile.location = user.location || ''
    profile.profileTheme = user.profileTheme || 'ribbons'
    profile.bio = user.bio || ''
    
    if (user.socialLinks) {
      profile.socialLinks.instagram = user.socialLinks.instagram || ''
      profile.socialLinks.twitter = user.socialLinks.twitter || ''
      profile.socialLinks.youtube = user.socialLinks.youtube || ''
      profile.socialLinks.soundcloud = user.socialLinks.soundcloud || ''
    }
    
    // Format date string for HTML date input (YYYY-MM-DD)
    if (user.dateOfBirth) {
      try {
        const date = new Date(user.dateOfBirth)
        profile.dateOfBirth = date.toISOString().split('T')[0]
      } catch(e) {
        profile.dateOfBirth = ''
      }
    } else {
      profile.dateOfBirth = ''
    }
  }
})

// Methods
const updateProfile = async () => {
  const { valid } = await profileForm.value.validate()
  if (!valid) return
  
  updatingProfile.value = true
  try {
    await auth.updateSettings(profile)
    showSnackbar(t('Settings.SuccessMsg'))
  } catch (error) {
    showSnackbar(t('Settings.ErrorMsg'), 'error')
    console.error(error)
  } finally {
    updatingProfile.value = false
  }
}

const updatePassword = async () => {
  const { valid } = await passwordForm.value.validate()
  if (!valid) return
  
  updatingPassword.value = true
  try {
    await api.put('/user/settings', { password: password.new })
    showSnackbar(t('Settings.SuccessMsg'))
    passwordForm.value.reset()
  } catch (error) {
    showSnackbar(t('Settings.ErrorMsg'), 'error')
    console.error(error)
  } finally {
    updatingPassword.value = false
  }
}

const onAvatarSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  uploadingAvatar.value = true
  try {
    const { data } = await api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    auth.user = { ...auth.user, photoUrl: data.photoUrl }
    showSnackbar(t('Settings.SuccessMsg'))
  } catch (error) {
    showSnackbar(t('Settings.ErrorMsg'), 'error')
    console.error(error)
  } finally {
    uploadingAvatar.value = false
    if (avatarInput.value) avatarInput.value.value = ''
  }
}
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
.border-white-10 {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>