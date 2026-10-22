<template>
  <v-main class="bg-black legal-page">
    <v-container class="py-10 py-md-14 px-3 px-sm-6" style="max-width: 1240px;">
      <v-row>
        <!-- Sidebar: document navigation -->
        <v-col cols="12" md="4" lg="3" class="order-2 order-md-1">
          <div class="position-sticky" style="top: 96px;">
            <v-card rounded="xl" border color="#121018" class="pa-2 mb-4" elevation="0">
              <div class="font-mono text-caption text-primary font-weight-bold text-uppercase px-3 pt-2 pb-1">
                {{ $t('Legal.OtherDocs') }}
              </div>
              <v-list nav density="comfortable" bg-color="transparent" class="pa-1">
                <v-list-item
                  v-for="item in LEGAL_DOCS"
                  :id="`legal-nav-${item.slug}`"
                  :key="item.slug"
                  :to="{ name: 'Legal', params: { doc: item.slug } }"
                  :prepend-icon="item.icon"
                  rounded="lg"
                  color="primary"
                  exact
                >
                  <v-list-item-title class="text-body-2">
                    {{ $t(`Legal.Nav.${item.key}`) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>

            <v-card rounded="xl" border color="#121018" class="pa-5" elevation="0">
              <v-avatar color="primary" variant="tonal" size="40" class="mb-3">
                <v-icon>mdi-lifebuoy</v-icon>
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold text-white mb-1">
                {{ $t('Legal.QuestionsTitle') }}
              </div>
              <p class="text-body-2 text-grey-lighten-1 mb-4">
                {{ $t('Legal.QuestionsDesc') }}
              </p>
              <v-btn
                id="legal-support-btn"
                :to="{ name: 'Support' }"
                variant="tonal"
                color="primary"
                rounded="pill"
                block
                class="text-none font-weight-bold"
                prepend-icon="mdi-help-circle-outline"
              >
                {{ $t('Legal.QuestionsButton') }}
              </v-btn>
            </v-card>
          </div>
        </v-col>

        <!-- Document body -->
        <v-col cols="12" md="8" lg="9" class="order-1 order-md-2 mb-8 mb-md-0">
          <v-chip
            size="small"
            variant="tonal"
            color="primary"
            class="font-mono font-weight-bold text-uppercase mb-4"
            :prepend-icon="doc.icon"
          >
            {{ $t('Legal.Badge') }}
          </v-chip>

          <h1 class="text-h4 text-md-h3 font-weight-black text-white mb-3">
            {{ $t(`Legal.Docs.${doc.key}.Title`) }}
          </h1>
          <p class="text-body-1 text-grey-lighten-1 mb-4" style="max-width: 720px;">
            {{ $t(`Legal.Docs.${doc.key}.Summary`) }}
          </p>
          <v-chip
            size="small"
            variant="outlined"
            class="font-mono text-caption text-grey-lighten-1 mb-8"
            prepend-icon="mdi-calendar-check-outline"
          >
            {{ $t('Legal.LastUpdated', { date: formattedDate }) }}
          </v-chip>

          <v-card rounded="xl" border color="#121018" class="pa-6 pa-md-10" elevation="0">
            <section
              v-for="(section, i) in sections"
              :id="`section-${i + 1}`"
              :key="`${doc.key}-${i}`"
            >
              <h2 class="text-h6 font-weight-bold text-white mb-2 d-flex align-center ga-3">
                <v-chip size="x-small" color="primary" variant="flat" class="font-mono font-weight-bold">
                  {{ String(i + 1).padStart(2, '0') }}
                </v-chip>
                {{ rt(section.Title) }}
              </h2>
              <p class="text-body-2 text-grey-lighten-1 mb-0" style="line-height: 1.8;">
                {{ rt(section.Body) }}
              </p>
              <v-divider v-if="i < sections.length - 1" class="my-6 border-opacity-25" />
            </section>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LEGAL_DOCS, LEGAL_LAST_UPDATED, findLegalDoc } from '@/constants/legal'

const APP_NAME = import.meta.env.VITE_APPLICATION_NAME || 'CHROMATIK'

const route = useRoute()
const { t, tm, rt, locale } = useI18n()

// Router guard guarantees a valid slug; fall back to the first doc defensively.
const doc = computed(() => findLegalDoc(route.params.doc) || LEGAL_DOCS[0])

const sections = computed(() => {
  const list = tm(`Legal.Docs.${doc.value.key}.Sections`)
  return Array.isArray(list) ? list : []
})

const formattedDate = computed(() =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(LEGAL_LAST_UPDATED))
)

watch(
  [doc, locale],
  () => {
    document.title = `${t(`Legal.Docs.${doc.value.key}.Title`)} | ${APP_NAME}`
  },
  { immediate: true, flush: 'post' }
)
</script>
