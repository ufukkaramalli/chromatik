<template>
  <v-main>
    <LoginForm>
      <!-- App name -->
      <template #app-name>
        <h1 class="font-weight-regular text-center xxix-regular login text-shadow">
          {{ appName }}
        </h1>
      </template>

      <!-- Custom header override if needed -->
      <template #default>
        {{ $t('Login.headers.SignIn') }}
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
</script>

<style scoped lang="scss">
.text-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}
</style>