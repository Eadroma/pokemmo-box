<script setup lang="ts">
const { t } = useI18n()
usePageSeo(() => t('seo.homeTitle'), () => t('seo.home'))
// Each tool gets a Pokémon that fits it: Rotom (dex), Drattak (live alphas), Porygon (data import), Carchacrok (team), Métamorph (breeding), Tropius (berries), Queulorior (cosmetics).
const tools = [
  { to: '/pokedex', title: 'nav.pokedex', text: 'home.pokedex', mon: 479 },
  { to: '/essaims', title: 'swarms.title', text: 'home.swarms', mon: 373 },
  { to: '/guides', title: 'guides.title', text: 'home.guides', mon: 52 },
  { to: '/collection', title: 'nav.collection', text: 'home.collection', mon: 137 },
  { to: '/team', title: 'nav.team', text: 'home.team', mon: 445 },
  { to: '/elevage', title: 'breeding.title', text: 'home.breeding', mon: 132 },
  { to: '/baies', title: 'berries.title', text: 'home.berries', mon: 357 },
  { to: '/cosmetiques', title: 'cosmetics.title', text: 'home.cosmetics', mon: 235 },
]
const { loaded, alphas, swarms, mon, left, where } = useSpawns()
const live = computed(() => [...alphas.value, ...swarms.value])
const collection = useCollection()
const { name, monName } = useLoc()
const speciesList = ref<Species[]>([])
onMounted(() => loadData<Species[]>('species').then(s => (speciesList.value = s), () => {}))
const sp = (id: number) => speciesList.value.find(s => s.id === id)
// Always six slots, like the in-game party: empty ones stay as recessed wells.
const party = computed(() => Array.from({ length: 6 }, (_, i) => collection.value?.party[i]))
</script>

<template>
  <section class="hero">
    <h1>{{ $t('app.name') }}</h1>
    <p class="lead">
      {{ $t('app.tagline') }}
    </p>
    <NuxtLink
      to="/collection"
      class="party"
      :aria-label="$t(collection ? 'home.party' : 'home.partyEmpty')"
    >
      <span
        v-for="(m, i) in party"
        :key="i"
        class="slot"
        :title="m ? `${monName(m, sp(m.species_id))} · ${m.level}` : undefined"
      ><img
        v-if="m"
        class="px"
        :src="icon(m.species_id)"
        alt=""
        width="56"
        height="56"
      ></span>
      <span class="party-note muted">{{ $t(collection ? 'home.party' : 'home.partyEmpty') }}</span>
    </NuxtLink>
  </section>

  <section
    v-if="loaded"
    class="now"
  >
    <div class="now-head">
      <h2>{{ $t('home.now') }}</h2>
      <i18n-t
        keypath="home.nowSource"
        tag="span"
        class="muted"
      >
        <template #source>
          <a
            :href="ALPHAPEDIA"
            target="_blank"
            rel="noopener"
          >{{ $t('swarms.source') }}</a>
        </template>
      </i18n-t>
    </div>
    <template v-if="live.length">
      <!-- Alphas and swarms in their own labelled groups: same card, different colour and chip. -->
      <template
        v-for="group in [{ kind: 'alpha', list: alphas }, { kind: 'swarm', list: swarms }] as const"
        :key="group.kind"
      >
        <h3
          v-if="group.list.length"
          class="group"
          :class="group.kind"
        >
          {{ $t(`swarms.heading.${group.kind}`, { n: group.list.length }) }}
        </h3>
        <div
          v-if="group.list.length"
          class="live"
        >
          <NuxtLink
            v-for="s in group.list"
            :key="s.id"
            to="/essaims"
            class="spawn"
            :class="s.kind"
          >
            <span class="slot"><img
              v-if="mon(s)"
              class="px"
              :src="icon(mon(s)!.id)"
              alt=""
              width="36"
              height="36"
            ></span>
            <span class="info">
              <strong>{{ mon(s) ? name(mon(s)) : s.pokemon }}<span
                class="chip kind"
                :class="s.kind"
              >{{ s.kind === 'alpha' ? $t('swarms.alphaChip') : $t('swarms.swarmChip') }}</span></strong>
              <span class="muted">{{ where(s) }}</span>
            </span>
            <span class="time">{{ left(s) }}</span>
          </NuxtLink>
        </div>
      </template>
    </template>
    <p
      v-else
      class="muted"
    >
      {{ $t('home.nothingNow') }}
      <NuxtLink to="/essaims">
        {{ $t('home.seeRecent') }}
      </NuxtLink>
    </p>
  </section>

  <h2>{{ $t('home.tools') }}</h2>
  <div class="tools">
    <NuxtLink
      v-for="tool in tools"
      :key="tool.to"
      :to="tool.to"
      class="tool"
    >
      <span class="slot"><img
        class="px"
        :src="icon(tool.mon)"
        alt=""
        width="72"
        height="72"
      ></span>
      <span>
        <strong>{{ $t(tool.title) }}</strong>
        <span class="muted">{{ $t(tool.text) }}</span>
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.hero { padding: 28px 0 12px; }
.hero h1 { font-size: clamp(2.8rem, 8vw, 5rem); line-height: .95; }
.hero .lead { font-size: 1.05rem; }
.party { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; text-decoration: none; margin-bottom: 8px; }
.party .slot { width: 68px; height: 68px; }
.party:hover .slot { box-shadow: inset 0 0 0 3px var(--accent); }
.party-note { font-size: .88rem; margin-left: 8px; }
.party-note::after { content: ' ›'; }
.now { margin: 8px 0 12px; }
.now-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; margin-bottom: 10px; }
.now-head h2 { margin: 0; }
.now-head .muted { font-size: .85rem; }
.now a { color: var(--text); }
.live { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.spawn { display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); text-decoration: none; }
.group { display: flex; align-items: center; gap: 8px; margin: 14px 0 8px; font-size: .9rem; font-weight: 700; }
.group::before { content: ''; width: 10px; height: 10px; border-radius: 2px; background: var(--k); }
.group.alpha, .spawn.alpha, .kind.alpha { --k: var(--accent); }
.group.swarm, .spawn.swarm, .kind.swarm { --k: var(--cool); }
.spawn { border-left: 4px solid var(--k); }
.chip.kind { margin-left: 2px; background: color-mix(in srgb, var(--k) 28%, var(--surface-2)); }
.spawn:hover { filter: brightness(1.08); }
.spawn .slot { width: 48px; height: 48px; }
.info { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; font-size: .9rem; }
.info strong { display: flex; align-items: center; gap: 6px; }
.info .muted { font-size: .8rem; }
.time { flex: none; padding: 1px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-text); font-weight: 650; font-size: .78rem; }
.tools { display: grid; gap: 4px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
.tool { display: flex; gap: 16px; align-items: center; padding: 12px; border-radius: var(--radius); text-decoration: none; }
.tool:hover { background: var(--surface); }
.tool:hover .slot { box-shadow: inset 0 0 0 3px var(--accent); }
.tool .slot { width: 84px; height: 84px; }
.tool strong { display: block; font-size: 1.05rem; }
.tool .muted { display: block; font-size: .9rem; line-height: 1.45; }
</style>
