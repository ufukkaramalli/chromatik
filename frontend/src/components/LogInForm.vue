<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <!-- Logo / App Name Section -->
        <div class="text-center mb-8 animate__animated animate__fadeIn">
          <slot name="app-name"></slot>
          <p class="text-subtitle-1 text-medium-emphasis mt-2">
            {{ $t('Login.headers.WelcomeBack') || 'Welcome back to Chromatik' }}
          </p>
        </div>

        <!-- Login Card with Glassmorphism -->
        <v-card
          class="login-card mx-auto elevation-24"
          max-width="450"
          border
        >
          <v-toolbar color="primary" class="text-center justify-center pt-2 pb-2">
            <v-toolbar-title class="text-h5 font-weight-bold">
              <slot>{{ $t('Login.headers.SignIn') || 'Sign In' }}</slot>
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="pa-8">
            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submit">
              <!-- Email -->
              <v-text-field
                v-model="form.email"
                :label="$t('Login.placeholders.Email')"
                :rules="[rules.required, rules.email]"
                prepend-inner-icon="mdi-email-outline"
                variant="filled"
                density="comfortable"
                class="mb-4"
                color="primary"
                type="email"
                autocomplete="email"
                :disabled="loading"
              ></v-text-field>

              <!-- Password -->
              <v-text-field
                v-model="form.password"
                :label="$t('Login.placeholders.Password')"
                :rules="[rules.required, rules.min]"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="filled"
                density="comfortable"
                class="mb-2"
                color="primary"
                autocomplete="current-password"
                :disabled="loading"
              ></v-text-field>

              <!-- Forgot Password link -->
              <div class="d-flex justify-end mb-6">
                <a href="#" class="text-caption text-primary text-decoration-none font-weight-bold">
                  {{ $t('Login.headers.ForgotPassword') || 'Forgot password?' }}
                </a>
              </div>

              <!-- Error Alert -->
              <v-expand-transition>
                <v-alert
                  v-if="errorMessage"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4 text-caption"
                  closable
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </v-alert>
              </v-expand-transition>

              <!-- Login Button -->
              <v-btn
                type="submit"
                color="primary"
                size="x-large"
                block
                :loading="loading"
                :disabled="!isFormValid"
                class="login-btn mt-2 font-weight-bold"
                elevation="8"
              >
                {{ $t('Login.buttons.Login') }}
                <v-icon end icon="mdi-login-variant"></v-icon>
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Social Login Section -->
          <v-card-text class="text-center py-6">
            <p class="text-caption text-medium-emphasis mb-4">{{ $t('Login.headers.Or') || 'Or continue with' }}</p>
            <div class="d-flex justify-center gap-4">
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-google</v-icon></v-btn>
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-apple</v-icon></v-btn>
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-twitter</v-icon></v-btn>
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-facebook</v-icon></v-btn>
            </div>
          </v-card-text>

          <v-card-actions class="justify-center pb-6">
            <span class="text-body-2 text-medium-emphasis">{{ $t('Login.headers.NoAccount') || "Don't have an account?" }}</span>
            <v-btn
              variant="text"
              color="primary"
              class="text-none font-weight-bold px-2"
              @click="router.push({ name: 'Register' })"
            >
              {{ $t('Login.buttons.SignUp') || 'Sign Up' }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Dynamic slot for extra content -->
        <slot name="another"></slot>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

// State
const formRef = ref(null)
const isFormValid = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

// Validation Rules
const rules = {
  required: v => !!v || t('Form.required') || 'Required',
  min: v => (v && v.length >= 8) || `${t('Form.min') || 'Min'} 8 ${t('Form.character') || 'characters'}`,
  email: v => /.+@.+\..+/.test(v) || t('Form.invalidemail') || 'E-mail must be valid',
}

// Methods
const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    const success = await auth.logIn(form)
    if (success !== false) {
      router.replace({ name: 'Dashboard' })
    } else {
      errorMessage.value = t('Login.errors.InvalidCredentials') || 'Invalid email or password.'
    }
  } catch (error) {
    console.error('[Login Error]', error)
    errorMessage.value = error.response?.data?.message || t('Login.errors.Failed') || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">

.login-card {
  background: rgba(33, 33, 33, 0.8) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45) !important;
  }
}

.login-btn {
  height: 52px !important;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  text-transform: none;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:not(:disabled):hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(211, 47, 47, 0.4) !important;
  }
}

.social-icon {
  transition: all 0.3s ease;
  border-color: rgba(255, 255, 255, 0.2) !important;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: var(--v-primary-base) !important;
    transform: scale(1.1);
  }
}

.gap-4 {
  gap: 16px;
}

// Custom styling for filled inputs to match glass aesthetic
:deep(.v-field--variant-filled) {
  background-color: rgba(255, 255, 255, 0.03) !important;
  border-radius: 10px !important;

  .v-field__outline {
    display: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.06) !important;
  }

  &.v-field--focused {
    background-color: rgba(255, 255, 255, 0.08) !important;
    .v-field__overlay {
      background-color: transparent !important;
    }
  }
}

.text-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>