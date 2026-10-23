<template>
  <v-main class="support-page">
    <v-container class="py-10 py-md-14 px-3 px-sm-6" style="max-width: 1240px;">
      <!-- Hero -->
      <div class="text-center mb-10 mb-md-14">
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          class="font-mono font-weight-bold text-uppercase mb-4"
          prepend-icon="mdi-lifebuoy"
        >
          {{ $t('Support.Badge') }}
        </v-chip>
        <h1 class="text-h4 text-md-h3 font-weight-black text-high-emphasis mb-3">
          {{ $t('Support.Title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mx-auto mb-0" style="max-width: 640px;">
          {{ $t('Support.Subtitle') }}
        </p>
      </div>

      <v-row>
        <!-- FAQ -->
        <v-col cols="12" md="8">
          <div class="font-mono text-caption text-primary font-weight-bold text-uppercase mb-3">
            {{ $t('Support.FaqTitle') }}
          </div>
          <v-expansion-panels variant="accordion" class="support-faq">
            <v-expansion-panel
              v-for="(item, i) in faq"
              :id="`faq-${i + 1}`"
              :key="i"
              bg-color="surface"
              class="border"
            >
              <v-expansion-panel-title class="font-weight-bold text-high-emphasis">
                <v-icon size="18" color="primary" class="mr-3">mdi-help-circle-outline</v-icon>
                {{ rt(item.Q) }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis" style="line-height: 1.8;">
                {{ rt(item.A) }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>

        <!-- Contact + legal -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" border color="surface" class="pa-6 mb-4" elevation="0">
            <v-avatar color="primary" variant="tonal" size="44" class="mb-3">
              <v-icon>mdi-email-fast-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-high-emphasis mb-1">
              {{ $t('Support.ContactTitle') }}
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ $t('Support.ContactDesc') }}
            </p>

            <template v-if="SUPPORT_EMAIL">
              <v-btn
                id="support-email-btn"
                :href="`mailto:${SUPPORT_EMAIL}`"
                color="primary"
                rounded="pill"
                block
                class="text-none font-weight-bold mb-2"
                prepend-icon="mdi-send-outline"
              >
                {{ $t('Support.ContactButton') }}
              </v-btn>
              <div class="font-mono text-caption text-medium-emphasis text-center mb-3">
                {{ SUPPORT_EMAIL }}
              </div>
            </template>
            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="text-body-2 mb-3"
            >
              {{ $t('Support.ContactUnavailable') }}
            </v-alert>

            <div class="d-flex align-center text-caption text-grey">
              <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
              {{ $t('Support.ResponseTime') }}
            </div>
          </v-card>

          <v-card rounded="xl" border color="surface" class="pa-2" elevation="0">
            <div class="font-mono text-caption text-primary font-weight-bold text-uppercase px-3 pt-2 pb-1">
              {{ $t('Support.LegalTitle') }}
            </div>
            <v-list nav density="compact" bg-color="transparent" class="pa-1">
              <v-list-item
                v-for="item in LEGAL_DOCS"
                :id="`support-legal-${item.slug}`"
                :key="item.slug"
                :to="{ name: 'Legal', params: { doc: item.slug } }"
                :prepend-icon="item.icon"
                append-icon="mdi-chevron-right"
                rounded="lg"
              >
                <v-list-item-title class="text-body-2">
                  {{ $t(`Legal.Nav.${item.key}`) }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LEGAL_DOCS, SUPPORT_EMAIL } from '@/constants/legal'

const { tm, rt } = useI18n()

const faq = computed(() => {
  const list = tm('Support.Faq')
  return Array.isArray(list) ? list : []
})
</script>
