<template>
    <v-main>
        <RegisterForm>
            <template #app-name>
                <h1 class="font-weight-regular text-center xxix-regular login text-shadow">
                {{appName}}
                </h1>
            </template>
            <template #default>
                {{$t('Register.headers.SignIn')}}
            </template>
        </RegisterForm>
    </v-main>
</template>
<script>
import { mapGetters } from 'vuex'
import RegisterForm from '@/components/Forms/RegisterForm.vue'
export default {
  components: {
    RegisterForm
  },
  computed: {
    ...mapGetters({
      appName: 'getAppName'
    })
  }
}
</script>
