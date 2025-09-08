<template>
  <v-main v-if="authenticated">
    <v-container fluid>
      <v-row>
        <v-col>
          <v-expansion-panels v-model="panel" multiple hover>
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

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      panel: [],
      username: '',
      rules: {
        required: v => !!v || this.$t('Form.required'),
        counterMin: v => (v || '').length >= 8 || this.$t('Form.min') + ' 8 ' + this.$t('Form.character'),
        counterMax: v => (v || '').length <= 20 || this.$t('Form.max') + ' 20 ' + this.$t('Form.character'),
        email: v => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(v) || this.$t('Form.invalidemail')
        },
        noSpace: v => (v || '').indexOf(' ') < 0 || 'No spaces are allowed'
      },
      settings: {
        username: {
          success: false,
          error: false,
          loading: false,
          disabled: false
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      authenticated: 'auth/authenticated',
      user: 'auth/user'
    }),
    getUsername: {
      get() {
        return this.username || this.user.slug
      },
      set(value) {
        this.username = value
      }
    }
  },
  methods: {
    async SET_USERNAME() {
      if (!this.$refs.usernameForm.validate()) {
        this.settings.username.error = true
        this.settings.username.success = false
        return
      }

      this.settings.username.loading = true
      this.settings.username.disabled = true

      try {
        const response = await axios.post('auth/settings/username', {
          username: this.username
        })

        if (response.data.status === 1 || this.user.slug === this.username) {
          this.settings.username.success = true
          this.settings.username.error = false
        } else {
          this.settings.username.success = false
          this.settings.username.error = true
        }
      } catch (err) {
        console.error(err)
        this.settings.username.success = false
        this.settings.username.error = true
      } finally {
        this.settings.username.loading = false
        this.settings.username.disabled = false
      }
    }
  }
}
</script>
