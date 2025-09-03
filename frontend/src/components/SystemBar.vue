<template>
    <v-system-bar window app color="primary" class="darken-4">
      <v-spacer></v-spacer>
      <v-btn text small tile @click="$i18n.locale = 'en'" :disabled="$i18n.locale == 'en'">EN</v-btn>
      <v-btn text small tile @click="$i18n.locale = 'tr'" :disabled="$i18n.locale == 'tr'">TR</v-btn>
    </v-system-bar>
</template>
