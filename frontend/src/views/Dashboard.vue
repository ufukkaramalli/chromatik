<template>
  <v-main v-cloak>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <json-viewer v-if="authenticated" :value="user" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const { authenticated, user } = storeToRefs(auth)
</script>