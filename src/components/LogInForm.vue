<template>
  <v-container fluid class="fill-height">
        <v-row align="center" justify="center" class="d-flex flex-column">
          <v-col cols="11" md="5" lg="4">
              <slot name="app-name"></slot>
          </v-col>
          <v-col cols="11" md="5" lg="4" class="pa-0 mb-4">
              <v-divider></v-divider>
          </v-col>
          <v-divider></v-divider>
          <v-col cols="11" md="5" lg="4" class="grey darken-3 pa-0 rounded">
            <v-toolbar color="primary" dark class="rounded-b-0 rounded-t">
              <v-toolbar-title class="mx-auto">
                <slot></slot>
              </v-toolbar-title>
            </v-toolbar>
            <v-form autocomplete="off" ref="loginForm" v-model="valid" @submit.prevent="submit">
            <v-card-text class="pb-0 pt-8">
                <v-text-field :label="$t('Login.placeholders.Email')" type="email" outlined prepend-icon="mdi-account" v-model="form.email" clearable :rules="[rules.required, rules.email]"></v-text-field>
                <v-text-field :label="$t('Login.placeholders.Password')" :rules="[rules.required, rules.counter]" outlined prepend-icon="mdi-lock" type="password" v-model="form.password"></v-text-field>
            </v-card-text>
            <v-card-actions class="px-4 pt-0 pb-4">
              <v-btn :disabled="!valid" block type="submit" large color="primary">{{$t('Login.buttons.Login')}}</v-btn>
            </v-card-actions>
            </v-form>
          </v-col>
          <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-center pa-0 mt-4">
             <v-divider></v-divider>
             <v-col cols="auto" class="text-uppercase">{{$t('Login.headers.Or')}}</v-col>
             <v-divider></v-divider>
          </v-col>
          <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-space-between pa-0 mt-4">
            <slot name="social"></slot>
          </v-col>
          <slot name="another"></slot>
        </v-row>
        <v-overlay :value="overlayProgress" absolute>
          <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
        </v-overlay>
  </v-container>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data: function () {
    return {
      overlayProgress: false,
      active: false,
      valid: false,
      form: {
        email: '',
        password: ''
      },
      rules: {
        required: value => !!value || this.$t('Form.required'),
        counter: value => value.length >= 8 || this.$t('Form.min') + ' 8 ' + this.$t('Form.character'),
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || this.$t('Form.invalidemail')
        }
      }
    }
  },
  methods: {
    ...mapActions({
      logIn: 'auth/logIn'
    }),
    submit () {
      this.$refs.loginForm.validate()
      this.overlayProgress = true
      this.logIn(this.form).then(() => {
        this.overlayProgress = false
        this.$router.replace({
          name: 'Dashboard'
        })
      }, () => { this.overlayProgress = false })
    }
  },
  computed: {
    ...mapGetters({
      LoginOverlay: 'getLoginOverlay'
    })
  }
}
</script>
