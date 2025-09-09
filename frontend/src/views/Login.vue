<template>
  <v-main>
    <LoginForm>
      <!-- App name -->
      <template #app-name>
        <h1 class="font-weight-regular text-center xxix-regular login text-shadow">
          {{ appName }}
        </h1>
      </template>

      <!-- Default header -->
      <template #default>
        {{ $t('Login.headers.SignIn') }}
      </template>

      <!-- Social buttons -->
      <template #social>
        <v-btn size="large" icon tile><v-icon>mdi-twitter</v-icon></v-btn>
        <v-btn size="large" icon tile><v-icon>mdi-facebook</v-icon></v-btn>
        <v-btn size="large" icon tile><v-icon>mdi-soundcloud</v-icon></v-btn>
        <v-btn size="large" icon tile><v-icon>mdi-apple</v-icon></v-btn>
      </template>

      <!-- Sign up section -->
      <template #another>
        <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-space-between pa-0 mt-9">
          <v-divider />
        </v-col>
        <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-center pa-0 mt-8">
          {{ $t('Login.headers.NoAccount') || "Don't have an account?" }}
        </v-col>
        <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-center pa-0 mt-8">
          <v-btn block color="primary" @click="goRegister">
            {{ $t('Login.buttons.SignUp') || 'Sign Up' }}
          </v-btn>
        </v-col>
      </template>
    </LoginForm>
  </v-main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import LoginForm from '@/components/LogInForm.vue'

const router = useRouter()

// Pinia store
const app = useAppStore()
const { appName } = storeToRefs(app)

const goRegister = () => {
  router.replace({ name: 'Register' })
}
</script>

<style scoped lang="scss">
.button {
  &:hover { text-decoration: underline !important; }
  &:focus { outline: none !important; }
}
</style>