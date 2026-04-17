<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <!-- Logo / App Name Section -->
        <div class="text-center mb-8 animate__animated animate__fadeIn">
          <slot name="app-name"></slot>
          <p class="text-subtitle-1 text-medium-emphasis mt-2">
            {{ $t('Register.headers.WelcomeText') || 'Join our creative community' }}
          </p>
        </div>

        <!-- Registration Card with Glassmorphism -->
        <v-card
          class="registration-card mx-auto elevation-24"
          max-width="450"
          border
        >
          <v-toolbar color="primary" class="text-center justify-center pt-2 pb-2">
            <v-toolbar-title class="text-h5 font-weight-bold">
              <slot>{{ $t('Register.headers.CreateAccount') || 'Create Account' }}</slot>
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="pa-8">
            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submit">
              <!-- Username -> Backend 'name' -->
              <v-text-field
                v-model="formData.username"
                :label="$t('Register.placeholders.Username')"
                :rules="rules.username"
                prepend-inner-icon="mdi-account-outline"
                variant="filled"
                density="comfortable"
                class="mb-2"
                color="primary"
                autocomplete="username"
                :disabled="loading"
              ></v-text-field>

              <!-- Email -->
              <v-text-field
                v-model="formData.email"
                :label="$t('Register.placeholders.Email')"
                :rules="rules.email"
                prepend-inner-icon="mdi-email-outline"
                variant="filled"
                density="comfortable"
                class="mb-2"
                color="primary"
                type="email"
                autocomplete="email"
                :disabled="loading"
              ></v-text-field>

              <!-- Password -->
              <v-text-field
                v-model="formData.password"
                :label="$t('Register.placeholders.Password')"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="filled"
                density="comfortable"
                class="mb-2"
                color="primary"
                autocomplete="new-password"
                :disabled="loading"
              ></v-text-field>

              <!-- Confirm Password -> Backend 'isValidPassword' -->
              <v-text-field
                v-model="formData.confirmpassword"
                :label="$t('Register.placeholders.ConfirmPassword')"
                :rules="rules.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="filled"
                density="comfortable"
                class="mb-4"
                color="primary"
                autocomplete="new-password"
                :disabled="loading"
              ></v-text-field>

              <!-- Terms and Conditions -->
              <v-checkbox
                v-model="formData.acceptterms"
                :rules="rules.terms"
                color="primary"
                class="terms-checkbox"
                density="compact"
              >
                <template v-slot:label>
                  <label class="text-caption cursor-pointer">
                    {{ $t('Register.terms.Agreement') || 'I agree to the' }}
                    <a href="#" class="text-primary text-decoration-none font-weight-bold" @click.stop>{{ $t('Register.terms.Service') || 'Terms of Service' }}</a>
                    {{ $t('Register.terms.And') || 'and' }}
                    <a href="#" class="text-primary text-decoration-none font-weight-bold" @click.stop>{{ $t('Register.terms.Privacy') || 'Privacy Policy' }}</a>
                  </label>
                </template>
              </v-checkbox>

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

              <!-- Register Button -->
              <v-btn
                type="submit"
                color="primary"
                size="x-large"
                block
                :loading="loading"
                :disabled="!isFormValid"
                class="register-btn mt-2 font-weight-bold"
                elevation="8"
              >
                {{ $t('Register.buttons.Register') }}
                <v-icon end icon="mdi-arrow-right"></v-icon>
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Social Registration Section -->
          <v-card-text class="text-center py-6">
            <p class="text-caption text-medium-emphasis mb-4">{{ $t('Register.headers.SocialRegister') || 'Or register with' }}</p>
            <div class="d-flex justify-center gap-4">
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-google</v-icon></v-btn>
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-apple</v-icon></v-btn>
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-twitter</v-icon></v-btn>
              <v-btn icon variant="outlined" size="small" color="white" class="social-icon"><v-icon>mdi-facebook</v-icon></v-btn>
            </div>
          </v-card-text>

          <v-card-actions class="justify-center pb-6">
            <span class="text-body-2 text-medium-emphasis">{{ $t('Register.headers.HaveAccount') || 'Already have an account?' }}</span>
            <v-btn
              variant="text"
              color="primary"
              class="text-none font-weight-bold px-2"
              @click="router.push({ name: 'Login' })"
            >
              {{ $t('Register.buttons.Login') || 'Log In' }}
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
import { api } from '@/lib/axios'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

// State
const formRef = ref(null)
const isFormValid = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmpassword: '',
  acceptterms: false,
})

// Validation Rules
const rules = {
  username: [
    v => !!v || t('Form.required') || 'Username is required',
    v => (v && v.length >= 3) || `${t('Form.min') || 'Min'} 3 ${t('Form.character') || 'characters'}`,
    v => (v && v.length <= 20) || `${t('Form.max') || 'Max'} 20 ${t('Form.character') || 'characters'}`,
    v => /^[a-zA-Z0-9_-]*$/.test(v) || t('Register.errors.alphanumeric') || 'Alphanumeric characters only',
  ],
  email: [
    v => !!v || t('Register.errors.mailrequired') || 'Email is required',
    v => /.+@.+\..+/.test(v) || t('Register.errors.mailnotvalid') || 'E-mail must be valid',
  ],
  password: [
    v => !!v || t('Register.errors.passwordrequired') || 'Password is required',
    v => (v && v.length >= 6) || `${t('Form.min') || 'Min'} 6 ${t('Form.character') || 'characters'}`,
  ],
  confirmPassword: [
    v => !!v || t('Register.errors.cpasswordrequired') || 'Please confirm your password',
    v => v === formData.password || t('Register.errors.cpasswordnotmatch') || 'Passwords do not match',
  ],
  terms: [
    v => !!v || t('Register.errors.acceptterms') || 'You must agree to the terms',
  ],
}

// Methods
const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    // Backend payload mapping
    const payload = {
      name: formData.username,
      email: formData.email,
      password: formData.password,
      isValidPassword: formData.confirmpassword,
    }

    const response = await api.post('/user/register', payload)

    if (response?.data?.token || response?.data?.success) {
      // Auto-login after successful registration
      await auth.logIn({ email: formData.email, password: formData.password })
      router.replace({ name: 'Dashboard' })
    } else {
      errorMessage.value = response?.data?.message || 'An unexpected error occurred during registration.'
    }
  } catch (error) {
    console.error('[Registration Error]', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Registration failed. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">

.registration-card {
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

.v-toolbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.register-btn {
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

.cursor-pointer {
  cursor: pointer;
}

.text-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
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
</style>