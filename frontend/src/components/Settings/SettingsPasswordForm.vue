<template>
  <v-card class="bg-surface rounded-lg border pa-6">
    <h3 class="text-h6 font-weight-bold mb-4">{{ $t('Settings.ChangePassword') }}</h3>
    <v-form ref="formRef" @submit.prevent="$emit('submit')">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PasswordFormState } from '@/composables/settings/useSettings'

defineProps<{
  password: PasswordFormState
  rules: Record<string, (v: any) => true | string>
  updatingPassword: boolean
}>()

defineEmits<{
  (e: 'submit'): void
}>()

const formRef = ref<any>(null)

defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => formRef.value?.reset()
})
</script>
