<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="d-flex flex-column">
      <!-- App Name Slot -->
      <v-col cols="11" md="5" lg="4">
        <slot name="app-name"></slot>
      </v-col>

      <!-- Divider -->
      <v-col cols="11" md="5" lg="4" class="pa-0 mb-4">
        <v-divider></v-divider>
      </v-col>

      <v-divider></v-divider>

      <!-- Login Card -->
      <v-col cols="11" md="5" lg="4" class="grey darken-3 pa-0 rounded">
        <v-toolbar color="primary" class="rounded-t">
          <v-toolbar-title class="mx-auto">
            <slot></slot>
          </v-toolbar-title>
        </v-toolbar>

        <v-form ref="loginForm" v-model="valid" @submit.prevent="submit" autocomplete="off">
          <v-card-text class="pb-0 pt-8">
            <v-text-field
              v-model="form.email"
              :label="$t('Login.placeholders.Email')"
              type="email"
              outlined
              clearable
              prepend-icon="mdi-account"
              :rules="[rules.required, rules.email]"
            />
            <v-text-field
              v-model="form.password"
              :label="$t('Login.placeholders.Password')"
              type="password"
              outlined
              prepend-icon="mdi-lock"
              :rules="[rules.required, rules.counter]"
            />
          </v-card-text>

          <v-card-actions class="px-4 pt-0 pb-4">
            <v-btn :disabled="!valid" block large color="primary" type="submit">
              {{$t('Login.buttons.Login')}}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-col>

      <!-- OR Divider -->
      <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-center pa-0 mt-4">
        <v-divider></v-divider>
        <v-col cols="auto" class="text-uppercase">{{$t('Login.headers.Or')}}</v-col>
        <v-divider></v-divider>
      </v-col>

      <!-- Social Slot -->
      <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-space-between pa-0 mt-4">
        <slot name="social"></slot>
      </v-col>

      <!-- Another Slot -->
      <slot name="another"></slot>
    </v-row>

    <!-- Overlay Progress -->
    <v-overlay :model-value="overlayProgress" absolute>
      <v-progress-circular :size="70" :width="7" color="primary" indeterminate />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const store = useStore()
const router = useRouter()
const { t } = useI18n()

// Form state
const loginForm = ref(null)
const valid = ref(false)
const overlayProgress = ref(false)
const form = ref({
  email: '',
  password: ''
})

// Validation rules
const rules = {
  required: (value) => !!value || t('Form.required'),
  counter: (value) => value.length >= 8 || `${t('Form.min')} 8 ${t('Form.character')}`,
  email: (value) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || t('Form.invalidemail')
  }
}

// Submit
const submit = () => {
  loginForm.value.validate()
  overlayProgress.value = true
  store.dispatch('auth/logIn', form.value)
    .then(() => {
      overlayProgress.value = false
      router.replace({ name: 'Dashboard' })
    })
    .catch(() => { overlayProgress.value = false })
}
</script>