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
import { computed } from 'vue'
import { useStore } from 'vuex'
import RegisterForm from '@/components/Forms/RegisterForm.vue'

const store = useStore()
const appName = computed(() => store.getters['getAppName'])
</script>