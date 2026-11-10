<script setup lang="ts">
const route = useRoute()
const { list: watched, enabled: watching } = useWatch()
const links = [
  { to: '/pokedex', key: 'nav.pokedex' },
  { to: '/essaims', key: 'nav.swarms' },
  { to: '/guides', key: 'nav.guides' },
  { to: '/collection', key: 'nav.collection' },
  { to: '/team', key: 'nav.team' },
  { to: '/elevage', key: 'nav.breeding' },
  { to: '/baies', key: 'nav.berries' },
  { to: '/cosmetiques', key: 'nav.cosmetics' },
]
</script>

<template>
  <header class="top">
    <nav>
      <NuxtLink
        to="/"
        class="brand"
      >
        <img
          class="px"
          :src="icon(479)"
          alt=""
          width="36"
          height="36"
        >
        {{ $t('app.name') }}
      </NuxtLink>
      <div class="links">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          :class="{ on: route.path.startsWith(l.to) }"
        >
          {{ $t(l.key) }}
        </NuxtLink>
      </div>
      <HeaderPrefs />
    </nav>
  </header>
  <main><NuxtPage /></main>
  <ClientOnly>
    <SpawnWatcher v-if="watching && watched.length" />
  </ClientOnly>
</template>

<style scoped>
.top { background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
nav { max-width: 1200px; margin: 0 auto; padding: 0 16px; display: flex; align-items: center; gap: 24px; min-height: 60px; }
.brand { display: flex; align-items: center; gap: 4px; font: 600 1.3rem var(--display); text-decoration: none; white-space: nowrap; }
.brand img { margin: -4px 0; }
.links { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; min-width: 0; }
.links a { padding: 6px 12px; border-radius: 9px; text-decoration: none; color: var(--muted); white-space: nowrap; font-weight: 550; font-size: .92rem; }
.links a:hover { color: var(--text); }
.links a.on { color: var(--accent-text); background: var(--accent); border-radius: 0; clip-path: var(--notch); }
@media (max-width: 640px) {
  nav { flex-wrap: wrap; gap: 0 8px; padding-top: 8px; }
  .links { order: 3; width: 100%; padding: 6px 0 10px; }
}
</style>
