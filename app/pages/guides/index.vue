<script setup lang="ts">
const { t } = useI18n()
usePageSeo(() => t('meta.title', { page: t('guides.title') }), () => t('guides.intro'))
const GUIDES = [
  { to: '/guides/piece-rune', title: 'guides.rune.title', text: 'guides.rune.card', mon: 52 },
  { to: '/guides/7-hells', title: 'guides.hells.title', text: 'guides.hells.card', mon: 530 },
  { to: '/guides/evs', title: 'guides.evs.title', text: 'guides.evs.card', mon: 214 },
  { to: '/guides/shiny', title: 'guides.shiny.title', text: 'guides.shiny.card', mon: 130 },
  { to: '/guides/objets', title: 'guides.items.title', text: 'guides.items.card', mon: 215 },
]
</script>

<template>
  <h1>{{ $t('guides.title') }}</h1>
  <p class="lead">
    {{ $t('guides.intro') }}
  </p>
  <div class="list">
    <NuxtLink
      v-for="g in GUIDES"
      :key="g.to"
      :to="g.to"
      class="card guide"
    >
      <span class="slot"><img
        class="px"
        :src="icon(g.mon)"
        alt=""
        width="64"
        height="64"
      ></span>
      <span>
        <strong>{{ $t(g.title) }}</strong>
        <span class="muted">{{ $t(g.text) }}</span>
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.list { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
.guide { display: flex; gap: 14px; align-items: center; text-decoration: none; color: var(--text); }
.guide:hover { border-color: var(--accent); }
.guide .slot { width: 72px; height: 72px; }
.guide > span:last-child { display: flex; flex-direction: column; gap: 2px; }
</style>
