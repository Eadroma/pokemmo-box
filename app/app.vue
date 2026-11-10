<script setup lang="ts">
const { locale } = useI18n()
useHead({ htmlAttrs: { lang: locale } })
const { list: watched, enabled: watching } = useWatch()
</script>

<template>
  <AppHeaderNav />
  <main><NuxtPage /></main>
  <AppFooter />
  <ClientOnly>
    <SpawnWatcher v-if="watching && watched.length" />
  </ClientOnly>
</template>
