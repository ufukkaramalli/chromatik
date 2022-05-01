<template>
<v-main>
    <LoginForm>
      <template #app-name>
        <h1 class="font-weight-regular text-center xxix-regular login text-shadow">
          {{appName}}
        </h1>
      </template>
      <template #default>
        {{$t('Login.headers.SignIn')}}
      </template>
      <template #social>
        <v-btn large icon tile>
          <v-icon>mdi-twitter</v-icon>
        </v-btn>
        <v-btn large icon tile>
          <v-icon>mdi-facebook</v-icon>
        </v-btn>
        <v-btn large icon tile>
          <v-icon>mdi-soundcloud</v-icon>
        </v-btn>
        <v-btn large icon tile>
          <v-icon>mdi-apple</v-icon>
        </v-btn>
      </template>
      <template #another>
        <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-space-between pa-0 mt-9">
          <v-divider></v-divider>
        </v-col>
        <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-center pa-0 mt-8">
          Don't have an account?
        </v-col>
        <v-col cols="11" md="5" lg="4" class="d-flex align-center justify-center pa-0 mt-8">
          <v-btn block color="primary" @click="RegisterButton">Sign Up</v-btn>
        </v-col>
      </template>
    </LoginForm>
  </v-main>
</template>
<script>
import { mapGetters } from 'vuex'
import LoginForm from '@/components/LogInForm.vue'
export default {
  components: {
    LoginForm
  },
  computed: {
    ...mapGetters({
      appName: 'getAppName'
    })
  },
  methods: {
    RegisterButton () {
      this.$router.replace({
        name: 'Register'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.button {
  &:hover{
    text-decoration: underline !important;
  }
  &:focus{
    outline: none !important;
  }
}
</style>
