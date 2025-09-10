<template>
  <v-main>
    <v-container>
      <v-row v-if="authStore.isAuthenticated">
        <!-- Soundkits varsa -->
        <template v-if="Soundkits && Soundkits.length > 0">
          <v-col cols="12" class="secondary darken-2 rounded-lg">
            SOUNDKITS
          </v-col>
        </template>

        <!-- Hiç Soundkit yoksa -->
        <template v-else>
          <v-col
            cols="12"
            md="8"
            class="secondary darken-2 rounded-lg text-center"
            offset="0"
            offset-md="2"
          >
            <h1
              v-resize-text="{
                ratio: 1.3,
                minFontSize: '14px',
                maxFontSize: '30px',
                delay: 200
              }"
            >
              NO SOUNDKITS ADDED
            </h1>
            <v-divider class="my-3"></v-divider>
            <v-btn prepend-icon="mdi-plus">
              Add New Soundkit
            </v-btn>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Kullanıcının soundkitlerini çek
const Soundkits = computed(() => authStore.user?.soundkits || [])
</script>