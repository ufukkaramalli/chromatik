<template>
  <v-main>
    <RegisterForm>
      <!-- App name -->
      <template #app-name>
        <h1 class="font-weight-regular text-center xxix-regular login text-shadow">
          {{ appName }}
        </h1>
      </template>

      <!-- Default header -->
      <template #default>
        {{ $t('Register.headers.SignIn') }}
      </template>
    </RegisterForm>
  </v-main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import RegisterForm from '@/components/Forms/RegisterForm.vue'

const app = useAppStore()
const { appName } = storeToRefs(app)
</script>