<template>
  <v-card rounded="0" class="soft-bloom-callout pa-8 pa-md-14 position-relative overflow-hidden mb-16 mb-md-24" elevation="8" border="t b" color="surface">
    <v-container class="py-6 py-sm-10 px-3 px-sm-6" style="max-width: 1480px;">
      <div class="callout-bloom-halo" aria-hidden="true"></div>

      <v-row align="center" justify="space-between" class="position-relative z-1">
        <v-col cols="12" lg="8">
          <v-chip size="small" variant="tonal" color="primary" class="font-mono text-caption font-weight-bold text-uppercase tracking-widest mb-4" prepend-icon="mdi-view-dashboard-outline">
            {{ $t('Home.Landing.Studio.Badge') }}
          </v-chip>

          <h2 class="text-h3 font-display font-weight-black text-high-emphasis mb-4 tracking-tight">
            {{ $t('Home.Landing.Studio.Title') }}
          </h2>

          <p class="text-body-1 font-body text-medium-emphasis mb-6" style="max-width: 680px; line-height: 1.7;">
            {{ $t('Home.Landing.Studio.Subtitle') }}
          </p>

          <!-- Value Chips for Creators using v-chip -->
          <div class="d-flex flex-wrap align-center ga-3 ga-sm-4">
            <v-chip variant="outlined" color="cyan" class="font-mono text-caption" prepend-icon="mdi-chart-areaspline">
              {{ $t('Home.Landing.Studio.Feature1') }}
            </v-chip>
            <v-chip variant="outlined" color="error" class="font-mono text-caption" prepend-icon="mdi-file-document-edit-outline">
              {{ $t('Home.Landing.Studio.Feature2') }}
            </v-chip>
            <v-chip variant="outlined" color="success" class="font-mono text-caption" prepend-icon="mdi-lightning-bolt">
              {{ $t('Home.Landing.Studio.Feature3') }}
            </v-chip>
          </div>
        </v-col>

        <v-col cols="12" lg="4" class="text-lg-right mt-8 mt-lg-0 d-flex flex-column flex-sm-row flex-lg-column align-lg-end ga-3 justify-lg-center">
          <v-btn
            size="x-large"
            color="primary"
            rounded="pill"
            class="font-mono font-weight-bold text-capitalize px-8 py-4"
            elevation="4"
            @click="$emit('upload')"
          >
            <v-icon size="20" class="mr-2">mdi-view-dashboard</v-icon>
            {{ $t('Home.Landing.Studio.Button') }}
          </v-btn>
          <v-btn
            size="large"
            variant="outlined"
            rounded="pill"
            class="font-mono font-weight-bold text-capitalize px-6 py-3"
            @click="$emit('soundkits')"
          >
            <v-icon size="18" color="primary" class="mr-2">mdi-waveform</v-icon>
            {{ $t('Home.Landing.SoundkitsCallout.Button') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'upload'): void
  (e: 'soundkits'): void
}>()
</script>

<style scoped lang="scss">
.font-display {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.font-body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
}

.font-mono {
  font-family: 'Space Grotesk', monospace, sans-serif !important;
}

.z-1 {
  z-index: 1;
}

.soft-bloom-callout {
  border-color: rgba(255, 82, 82, 0.3) !important;
  backdrop-filter: blur(28px);

  .v-theme--light & {
    background: #FFFFFF !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px -4px rgba(0, 0, 0, 0.04) !important;

    .callout-bloom-halo {
      display: none !important;
    }
  }

  .callout-bloom-halo {
    position: absolute;
    top: -80px;
    right: 15%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255, 82, 82, 0.28) 0%, transparent 70%);
    filter: blur(100px);
    pointer-events: none;
  }
}
</style>
