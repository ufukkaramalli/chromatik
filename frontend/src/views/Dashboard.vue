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
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const authenticated = computed(() => store.getters['auth/authenticated'])
const user = computed(() => store.getters['auth/user'])
</script>
