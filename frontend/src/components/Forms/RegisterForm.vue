<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="d-flex flex-column">
      <!-- App name -->
      <v-col cols="11" md="5" lg="4">
        <slot name="app-name"></slot>
      </v-col>

      <!-- Divider -->
      <v-col cols="11" md="5" lg="4" class="pa-0 mb-4">
        <v-divider></v-divider>
      </v-col>

      <!-- Card -->
      <v-col cols="11" md="5" lg="4" class="grey darken-3 pa-0 rounded">
        <v-toolbar color="primary" class="rounded-t">
          <v-toolbar-title class="mx-auto">
            <slot></slot>
          </v-toolbar-title>
        </v-toolbar>

        <v-form ref="registerForm" @submit.prevent="submit" autocomplete="off">
          <v-card-text class="pb-0 pt-8">
            <!-- Username -->
            <v-text-field
              v-model="form.username"
              :label="$t('Register.placeholders.Username')"
              variant="outlined"
              :counter="20"
              :maxlength="20"
              prepend-inner-icon="mdi:account"
              :error-messages="nameErrors"
              name="username"
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
              @blur="v$.form.username.$touch()"
              :disabled="settings.username.loading"
            />

            <!-- Email -->
            <v-text-field
              v-model="form.email"
              :label="$t('Register.placeholders.Email')"
              :error-messages="emailErrors"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi:email"
              name="email"
              autocomplete="email"
              inputmode="email"
              autocapitalize="none"
              spellcheck="false"
              @blur="v$.form.email.$touch()"
            />

            <!-- Password -->
            <v-text-field
              v-model="form.password"
              :label="$t('Register.placeholders.Password')"
              variant="outlined"
              prepend-inner-icon="mdi:lock"
              :append-inner-icon="show1 ? 'mdi:eye' : 'mdi:eye-off'"
              :type="show1 ? 'text' : 'password'"
              :error-messages="passwordErrors"
              name="password"
              autocomplete="new-password"
              autocapitalize="none"
              @blur="v$.form.password.$touch()"
              @click:append-inner="show1 = !show1"
            />

            <!-- Confirm Password -->
            <v-text-field
              v-model="form.confirmpassword"
              :label="$t('Register.placeholders.ConfirmPassword')"
              variant="outlined"
              prepend-inner-icon="mdi:lock"
              :append-inner-icon="show2 ? 'mdi:eye' : 'mdi:eye-off'"
              :type="show2 ? 'text' : 'password'"
              :error-messages="passwordConfirmErrors"
              name="confirm-password"
              autocomplete="new-password"
              autocapitalize="none"
              @blur="v$.form.confirmpassword.$touch()"
              @click:append-inner="show2 = !show2"
            />

            <!-- Terms -->
            <v-checkbox
              v-model="form.acceptterms"
              :error-messages="acceptTermErrors"
              class="mt-0 mb-3"
              @change="v$.form.acceptterms.$touch()"
            >
              <template #label>
                <span>
                  I have read and agree to the
                  <a target="_blank" href="https://vuetifyjs.com" @click.stop>Terms of service</a>
                  &
                  <a target="_blank" href="https://vuetifyjs.com" @click.stop>Privacy policy</a>.
                </span>
              </template>
            </v-checkbox>
          </v-card-text>

          <v-card-actions class="px-4 pt-0 pb-4">
            <v-btn
              block
              type="submit"
              size="large"
              color="primary"
              :disabled="v$.form.$invalid || settings.username.loading"
            >
              {{ $t('Register.buttons.Register') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-col>

      <slot name="another"></slot>
    </v-row>

    <!-- Overlay -->
    <v-overlay :model-value="overlayProgress" absolute>
      <v-progress-circular :size="70" :width="7" color="primary" indeterminate />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, minLength, email as emailRule, sameAs, helpers } from '@vuelidate/validators'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/axios'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

// form state
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmpassword: '',
  acceptterms: false,
})

const settings = reactive({
  username: { success: false, error: false, loading: false, disabled: false },
})

const overlayProgress = ref(false)
const show1 = ref(false)
const show2 = ref(false)

// validation rules
const rules = computed(() => ({
  form: {
    username: {
      required,
      maxLength: maxLength(20),
      minLength: minLength(3),
      regex: helpers.regex('alpha', /^[a-zA-Z0-9_-]*$/),
    },
    email: { required, email: emailRule },
    password: { required },
    confirmpassword: { required, sameAsPassword: sameAs(() => form.password) },
    acceptterms: { checked: (val) => !!val },
  },
}))

const v$ = useVuelidate(rules, { form })

// error helpers
const emailErrors = computed(() => {
  const errs = []
  if (!v$.value.form.email.$dirty) return errs
  !v$.value.form.email.email && errs.push(t('Register.errors.mailnotvalid'))
  !v$.value.form.email.required && errs.push(t('Register.errors.mailrequired'))
  return errs
})

const nameErrors = computed(() => {
  const errs = []
  if (!v$.value.form.username.$dirty) return errs
  !v$.value.form.username.minLength && errs.push(`${t('Form.min')} 3 ${t('Form.character')}`)
  !v$.value.form.username.maxLength && errs.push(`${t('Form.max')} 20 ${t('Form.character')}`)
  !v$.value.form.username.regex && errs.push(t('Register.errors.alphanumeric'))
  !v$.value.form.username.required && errs.push(t('Form.required'))
  return errs
})

const passwordErrors = computed(() => {
  const errs = []
  if (!v$.value.form.password.$dirty) return errs
  !v$.value.form.password.required && errs.push(t('Register.errors.passwordrequired'))
  return errs
})

const passwordConfirmErrors = computed(() => {
  const errs = []
  if (!v$.value.form.confirmpassword.$dirty) return errs
  !v$.value.form.confirmpassword.required && errs.push(t('Register.errors.cpasswordrequired'))
  !v$.value.form.confirmpassword.sameAsPassword && errs.push(t('Register.errors.cpasswordnotmatch'))
  return errs
})

const acceptTermErrors = computed(() => {
  const errs = []
  if (!v$.value.form.acceptterms.$dirty) return errs
  !v$.value.form.acceptterms.checked && errs.push(t('Register.errors.acceptterms'))
  return errs
})

const registerForm = ref(null)

const SignUp = async (credentials) => {
  try {
    return await api.post('/auth/signup', credentials)
  } catch (error) {
    return error.response
  }
}

const submit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  overlayProgress.value = true
  settings.username.loading = true
  try {
    const response = await SignUp(form)
    if (response?.data?.errors) {
      settings.username.success = false
      settings.username.error = true
      return
    }
    if (response?.data?.success) {
      // signup sonrası direkt login
      await auth.logIn({ email: form.email, password: form.password })
      router.replace({ name: 'Dashboard' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    overlayProgress.value = false
    settings.username.loading = false
  }
}
</script>