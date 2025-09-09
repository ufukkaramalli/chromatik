<template>
  <v-main v-if="authenticated">
    <v-container fluid>
      <v-row>
        <v-col>
          <v-expansion-panels v-model="panel" multiple hover>
            <!-- Panel 1 -->
            <v-expansion-panel>
              <v-expansion-panel-header ripple>
                Panel 1
                <template #actions>
                  <v-icon icon="$expand" color="primary" />
                </template>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <v-row class="mt-3">
                  <v-col cols="12">
                    <v-form ref="usernameForm" autocomplete="off" @submit.prevent="SET_USERNAME">
                      <v-text-field
                        v-model="getUsername"
                        :loading="settings.username.loading"
                        :success="settings.username.success"
                        :error="settings.username.error"
                        :rules="[rules.required, rules.counterMin, rules.counterMax, rules.noSpace]"
                        label="Username"
                        @change="SET_USERNAME"
                      >
                        <template #append>
                          <v-icon v-if="settings.username.success" color="green">mdi-check</v-icon>
                        </template>
                      </v-text-field>
                    </v-form>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- Panel 2 -->
            <v-expansion-panel>
              <v-expansion-panel-header ripple>
                Panel 2
                <template #actions>
                  <v-icon icon="$expand" color="primary" />
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row class="mt-3">
                  <v-col>CONTENT</v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <!-- Panel 3 -->
            <v-expansion-panel>
              <v-expansion-panel-header ripple>
                Panel 3
                <template #actions>
                  <v-icon icon="$expand" color="primary" />
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row class="mt-3">
                  <v-col>CONTENT</v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/axios'

const { t } = useI18n()
const auth = useAuthStore()
const { authenticated, user } = auth

const panel = ref([])
const username = ref('')

const settings = reactive({
  username: {
    success: false,
    error: false,
    loading: false,
    disabled: false,
  },
})

const rules = {
  required: (v) => !!v || t('Form.required'),
  counterMin: (v) =>
    (v || '').length >= 8 || `${t('Form.min')} 8 ${t('Form.character')}`,
  counterMax: (v) =>
    (v || '').length <= 20 || `${t('Form.max')} 20 ${t('Form.character')}`,
  email: (v) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(v) || t('Form.invalidemail')
  },
  noSpace: (v) => (v || '').indexOf(' ') < 0 || 'No spaces are allowed',
}

const getUsername = computed({
  get() {
    return username.value || user?.slug || ''
  },
  set(val) {
    username.value = val
  },
})

const usernameForm = ref(null)

const SET_USERNAME = async () => {
  if (!usernameForm.value?.validate()) {
    settings.username.error = true
    settings.username.success = false
    return
  }

  settings.username.loading = true
  settings.username.disabled = true

  try {
    const response = await api.post('/auth/settings/username', {
      username: username.value,
    })

    if (response.data.status === 1 || user?.slug === username.value) {
      settings.username.success = true
      settings.username.error = false
      // auth store’daki user objesini güncelle
      auth.user = { ...auth.user, slug: username.value }
    } else {
      settings.username.success = false
      settings.username.error = true
    }
  } catch (err) {
    console.error(err)
    settings.username.success = false
    settings.username.error = true
  } finally {
    settings.username.loading = false
    settings.username.disabled = false
  }
}
</script>