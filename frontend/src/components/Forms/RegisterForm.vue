<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="d-flex flex-column">
      <v-col cols="11" md="5" lg="4">
        <slot name="app-name"></slot>
      </v-col>
      <v-col cols="11" md="5" lg="4" class="pa-0 mb-4">
        <v-divider></v-divider>
      </v-col>
      <v-col cols="11" md="5" lg="4" class="grey darken-3 pa-0 rounded">
        <v-toolbar color="primary" dark class="rounded-b-0 rounded-t">
          <v-toolbar-title class="mx-auto">
            <slot></slot>
          </v-toolbar-title>
        </v-toolbar>

        <v-form ref="RegisterForm" v-model="valid" @submit.prevent="submit">
          <v-card-text class="pb-0 pt-8">
            <v-text-field
              :label="$t('Register.placeholders.Username')"
              outlined
              :counter="20"
              :maxlength="20"
              prepend-icon="mdi-account"
              v-model="form.username"
              :error-messages="nameErrors"
              required
              @blur="v$.form.username.$touch()"
            />
            <v-text-field
              :label="$t('Register.placeholders.Email')"
              :error-messages="emailErrors"
              type="email"
              outlined
              prepend-icon="mdi-email"
              v-model="form.email"
              @blur="v$.form.email.$touch()"
            />
            <v-text-field
              :label="$t('Register.placeholders.Password')"
              outlined
              prepend-icon="mdi-lock"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show1 ? 'text' : 'password'"
              :error-messages="passwordErrors"
              v-model="form.password"
              @blur="v$.form.password.$touch()"
              @click:append="show1 = !show1"
            />
            <v-text-field
              :label="$t('Register.placeholders.ConfirmPassword')"
              outlined
              prepend-icon="mdi-lock"
              :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show2 ? 'text' : 'password'"
              :error-messages="passwordConfirmErrors"
              v-model="form.confirmpassword"
              @blur="v$.form.confirmpassword.$touch()"
              @click:append="show2 = !show2"
            />
            <v-checkbox
              required
              v-model="form.acceptterms"
              :error-messages="acceptTermErrors"
              @change="v$.form.acceptterms.$touch()"
              class="mt-0 mb-3"
            >
              <template v-slot:label>
                <v-col class="pa-0" v-resize-text="{ratio:1.3, minFontSize: '7px', maxFontSize: '14.8px', delay: 200}">
                  I have read and agree to the
                  <a target="_blank" href="http://vuetifyjs.com" @click.stop>Terms of service</a>
                  &
                  <a target="_blank" href="http://vuetifyjs.com" @click.stop>Privacy policy</a>.
                </v-col>
              </template>
            </v-checkbox>
          </v-card-text>
          <v-card-actions class="px-4 pt-0 pb-4">
            <v-btn :disabled="v$.form.$invalid" block type="submit" large color="primary">{{$t('Register.buttons.Register')}}</v-btn>
          </v-card-actions>
        </v-form>
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
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, minLength, email, sameAs, helpers } from '@vuelidate/validators'
import axios from 'axios'

export default {
  setup () {
    const form = Vue.reactive({
      username: '',
      email: '',
      password: '',
      confirmpassword: '',
      acceptterms: false
    })

    const rules = {
      username: {
        required,
        maxLength: maxLength(20),
        minLength: minLength(3),
        regex: helpers.regex('alpha', /^[a-zA-Z0-9_-]*$/)
      },
      email: { required, email },
      password: { required },
      confirmpassword: { required, sameAsPassword: sameAs(form.password) },
      acceptterms: { checked: val => val }
    }

    const v$ = useVuelidate(rules, form)

    return { form, v$ }
  },
  data () {
    return {
      overlayProgress: false,
      valid: false,
      show1: false,
      show2: false,
      responseError: {
        email: '',
        username: ''
      }
    }
  },
  methods: {
    ...mapActions({ logIn: 'auth/logIn' }),
    async submit () {
      this.v$.$touch()
      if (!this.v$.$invalid) {
        this.overlayProgress = true
        try {
          const response = await this.SignUp(this.form)
          if (response.data.errors) {
            this.responseError = response.data.errors
            this.overlayProgress = false
          } else if (response.data.success) {
            this.logIn(response.data.success).then(() => {
              this.overlayProgress = false
              this.$router.replace({ name: 'Dashboard' })
            })
          }
        } catch (error) {
          console.log(error.response)
          this.overlayProgress = false
        }
      }
    },
    async SignUp (credentials) {
      try {
        const response = await axios.post('auth/signup', credentials)
        return response
      } catch (error) {
        return error.response
      }
    }
  },
  computed: {
    ...mapGetters({ LoginOverlay: 'getLoginOverlay' }),
    emailErrors () {
      const errors = []
      if (!this.v$.form.email.$dirty) return errors
      !this.v$.form.email.email && errors.push(this.$t('Register.errors.mailnotvalid'))
      !this.v$.form.email.required && errors.push(this.$t('Register.errors.mailrequired'))
      return errors
    },
    nameErrors () {
      const errors = []
      if (!this.v$.form.username.$dirty) return errors
      !this.v$.form.username.minLength && errors.push(this.$t('Form.min') + ' ' + 3 + ' ' + this.$t('Form.character'))
      !this.v$.form.username.maxLength && errors.push(this.$t('Form.max') + ' ' + 20 + ' ' + this.$t('Form.character'))
      !this.v$.form.username.regex && errors.push(this.$t('Register.errors.alphanumeric'))
      !this.v$.form.username.required && errors.push(this.$t('Form.required'))
      return errors
    },
    passwordErrors () {
      const errors = []
      if (!this.v$.form.password.$dirty) return errors
      !this.v$.form.password.required && errors.push(this.$t('Register.errors.passwordrequired'))
      return errors
    },
    passwordConfirmErrors () {
      const errors = []
      if (!this.v$.form.confirmpassword.$dirty) return errors
      !this.v$.form.confirmpassword.required && errors.push(this.$t('Register.errors.cpasswordrequired'))
      !this.v$.form.confirmpassword.sameAsPassword && errors.push(this.$t('Register.errors.cpasswordnotmatch'))
      return errors
    },
    acceptTermErrors () {
      const errors = []
      if (!this.v$.form.acceptterms.$dirty) return errors
      !this.v$.form.acceptterms.checked && errors.push(this.$t('Register.errors.acceptterms'))
      return errors
    }
  }
}
</script>
