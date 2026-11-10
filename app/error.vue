<script setup lang="ts">
import type { NuxtError } from '#app'

// Site-styled error page (404 and others), with the header and footer, instead of Nuxt's default one.
const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: () => t('meta.title', { page: t(notFound.value ? 'errorPage.notFound' : 'errorPage.other') }) })
const home = () => clearError({ redirect: '/' })
</script>

<template>
  <AppHeaderNav />
  <main class="err-page">
    <span class="slot"><img
      class="px"
      :src="icon(201)"
      alt=""
      width="96"
      height="96"
    ></span>
    <h1>{{ notFound ? $t('errorPage.notFound') : $t('errorPage.other') }}</h1>
    <p class="muted">
      {{ notFound ? $t('errorPage.notFoundText') : $t('errorPage.otherText') }}
    </p>
    <button
      class="primary"
      @click="home"
    >
      {{ $t('errorPage.home') }}
    </button>
  </main>
  <AppFooter />
</template>

<style scoped>
.err-page { display: grid; justify-items: start; gap: 12px; padding-top: 64px; padding-bottom: 96px; }
.err-page .slot { width: 112px; height: 112px; }
.err-page h1 { margin: 8px 0 0; }
</style>
