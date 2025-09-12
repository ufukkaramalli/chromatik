<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="d-flex flex-column">
      <v-col cols="11" md="5" lg="4">
        <slot name="app-name"></slot>
      </v-col>

      <v-col cols="11" md="5" lg="4" class="pa-0 mb-4">
        <v-divider></v-divider>
      </v-col>

      <v-col cols="11" md="5" lg="4" class="grey darken-3 pa-0 rounded">
        <v-toolbar color="primary" class="rounded-t">
          <v-toolbar-title class="mx-auto">
            <slot></slot>
          </v-toolbar-title>
        </v-toolbar>

        <v-form @submit.prevent="submit" autocomplete="off">
          <v-card-text class="pb-0 pt-8">

            <!-- name -->
            <v-text-field
              v-model="form.name"
              label="Username"
              variant="outlined"
              prepend-inner-icon="mdi:account"
              :counter="20"
              :error-messages="v$.form.name.$errors.map(e => e.$message)"
              @blur="v$.form.name.$touch()"
              @input="sanitizename"
            />

            <!-- Email -->
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi:email"
              :error-messages="v$.form.email.$errors.map(e => e.$message)"
              @blur="v$.form.email.$touch()"
            />

            <!-- Password -->
            <v-text-field
              v-model="form.password"
              label="Password"
              variant="outlined"
              prepend-inner-icon="mdi:lock"
              :append-inner-icon="show1 ? 'mdi:eye' : 'mdi:eye-off'"
              :type="show1 ? 'text' : 'password'"
              :error-messages="v$.form.password.$errors.map(e => e.$message)"
              @blur="v$.form.password.$touch()"
              @click:append-inner="show1 = !show1"
            />

            <!-- Confirm Password -->
            <v-text-field
              v-model="form.isValidPassword"
              label="Confirm Password"
              variant="outlined"
              prepend-inner-icon="mdi:lock"
              :append-inner-icon="show2 ? 'mdi:eye' : 'mdi:eye-off'"
              :type="show2 ? 'text' : 'password'"
              :error-messages="v$.form.isValidPassword.$errors.map(e => e.$message)"
              @blur="v$.form.isValidPassword.$touch()"
              @click:append-inner="show2 = !show2"
            />

            <!-- Terms -->
            <v-checkbox
              v-model="form.acceptterms"
              :error-messages="v$.form.acceptterms.$errors.map(e => e.$message)"
              @change="v$.form.acceptterms.$touch()"
              label="I agree to the Terms & Privacy Policy"
            />
          </v-card-text>

          <v-card-actions class="px-4 pt-0 pb-4">
            <v-btn
              block
              type="submit"
              size="large"
              color="primary"
              :disabled="v$.form.$invalid || loading"
            >
              Register
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-col>
    </v-row>

    <v-overlay :model-value="loading" absolute>
      <v-progress-circular :size="70" :width="7" color="primary" indeterminate />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, minLength, email as emailRule, sameAs, helpers } from '@vuelidate/validators'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

// form state
const form = reactive({
  name: '',
  email: '',
  password: '',
  isValidPassword: '',
  acceptterms: false,
})

const show1 = ref(false)
const show2 = ref(false)
const loading = ref(false)

// --- VALIDATION RULES WITH MESSAGES ---
const nameRule = helpers.withMessage(
  'Only English letters, numbers, space, _ and - allowed',
  helpers.regex(/^[A-Za-z0-9 _-]+$/)
)

const rules = computed(() => ({
  form: {
    name: {
      required: helpers.withMessage('Username is required', required),
      minLength: helpers.withMessage('At least 3 characters', minLength(3)),
      maxLength: helpers.withMessage('At most 20 characters', maxLength(20)),
      nameRule,
    },
    email: {
      required: helpers.withMessage('Email is required', required),
      email: helpers.withMessage('Invalid email', emailRule),
    },
    password: {
      required: helpers.withMessage('Password is required', required),
    },
    isValidPassword: {
      required: helpers.withMessage('Please confirm your password', required),
      sameAsPassword: helpers.withMessage(
        'Passwords do not match',
        sameAs(form.password)
      ),
    },
    acceptterms: {
      required: helpers.withMessage('You must accept the terms', (val) => val === true),
    },
  },
}))

const v$ = useVuelidate(rules, { form })

// name temizleyici
function sanitizename(event) {
  const value = typeof event === 'string' ? event : event?.target?.value || ''
  form.name = value
    .replace(/\u00A0/g, ' ')           // NBSP → normal boşluk
    .replace(/[^A-Za-z0-9 _-]/g, '')   // sadece izin verilenler
}

// API register + login
async function submit() {
  v$.value.$touch()
  if (v$.value.$invalid) return

  loading.value = true
  try {
    const res = await api.post('/user/register', form)

    if (res?.data?.success && res?.data?.token) {
      // authStore üzerinden token ile giriş
      await auth.attempt(res.data.token)

      // yönlendir
      router.replace({ name: 'Dashboard' })
    }
  } catch (e) {
    console.error('API error:', e)
  } finally {
    loading.value = false
  }
}
</script>