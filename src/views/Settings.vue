<template>
    <v-main v-if="authenticated">
        <v-container fluid>
        <v-row>
            <v-col>
                <v-expansion-panels v-model="panel" multiple hover>
                    <v-expansion-panel>
                        <v-expansion-panel-header ripple>
                            Panel 1
                            <template v-slot:actions>
                                <v-icon color="primary">$expand</v-icon>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row class="mt-3">
                                <v-col cols="12">
                                    <v-form ref="username" autocomplete="off" @submit.prevent="">
                                        <v-text-field
                                            :loading="settings.username.loading"
                                            :success="settings.username.success"
                                            :error="settings.username.error"
                                            :rules="[rules.required,rules.counterMin,rules.counterMax,rules.noSpace]"
                                            v-model="getUsername"
                                            :value="user.slug"
                                            label="Username"
                                            @input="SET_USERNAME"
                                        >
                                            <v-icon v-show="settings.username.success" slot="append" color="green">mdi-check</v-icon>
                                        </v-text-field>
                                    </v-form>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header ripple>
                            Panel 2
                            <template v-slot:actions>
                                <v-icon color="primary">$expand</v-icon>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row class="mt-3">
                                <v-col>
                                    CONTENT
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header ripple>
                            Panel 3
                            <template v-slot:actions>
                                <v-icon color="primary">$expand</v-icon>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row class="mt-3">
                                <v-col>
                                    CONTENT
                                </v-col>
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
  data () {
    return {
      panel: [],
      rules: {
        required: value => !!value || this.$t('Form.required'),
        counterMin: value => value.length >= 8 || this.$t('Form.min') + ' 8 ' + this.$t('Form.character'),
        counterMax: value => value.length <= 20 || this.$t('Form.min') + ' 20 ' + this.$t('Form.character'),
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || this.$t('Form.invalidemail')
        },
        noSpace: v => (v || '').indexOf(' ') < 0 || 'No spaces are allowed'
      },
      username: '',
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
      get () {
        return this.user.slug
      },
      set (value) {
        this.username = value
      }
    }
  },
  methods: {
    async SET_USERNAME () {
      if (this.$refs.username.validate()) {
        this.settings.username.loading = true
        this.settings.username.disabled = true
        axios.post('auth/settings/username', { username: this.username }).then((response) => {
          if (response.data.status === 1) {
            this.settings.username.success = true
            this.settings.username.error = false
            this.settings.username.loading = false
            this.settings.username.disabled = false
          } else {
            if (this.user.slug === this.username) {
              this.settings.username.success = true
              this.settings.username.error = false
              this.settings.username.loading = false
              this.settings.username.disabled = false
            } else {
              this.settings.username.success = false
              this.settings.username.error = true
              this.settings.username.loading = false
              this.settings.username.disabled = false
            }
          }
        }).catch((error) => {
          this.settings.username.loading = false
          this.settings.username.success = false
          this.settings.username.error = true
          console.log(error)
        })
      } else {
        this.settings.username.error = true
        this.settings.username.success = false
      }
    }
  }
}
</script>
