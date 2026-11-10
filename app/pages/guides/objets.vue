<script setup lang="ts">
import type { Horde } from '~/utils/evs'

// "Where to farm this item": wild Pokémon that can hold it (scripts/build-data.mjs → helditems.json) and where they appear.
const { t } = useI18n()
usePageSeo(() => t('meta.title', { page: t('guides.items.title') }), () => t('guides.items.card'))
const { name, place, kind } = useLoc()

const held = ref<Record<number, number[]>>({})
const items = ref<Record<number, Item>>({})
const species = ref<Record<number, Species>>({})
const hordes = ref<Horde[]>([])
const loadError = ref(false)
onMounted(() => Promise.all([loadData<Record<number, number[]>>('helditems'), loadData<Record<number, Item>>('items'), loadData<Species[]>('species'), loadData<Horde[]>('hordes')])
  .then(([h, i, s, ho]) => {
    held.value = h
    items.value = i
    species.value = Object.fromEntries(s.map(x => [x.id, x]))
    hordes.value = ho
  }, () => (loadError.value = true)))

const state = usePersisted('pokemmo:guide:items', { item: 0, q: '' })
const list = computed(() => Object.keys(held.value).map(Number)
  .filter(id => items.value[id])
  .map(id => ({ id, item: items.value[id]! }))
  .filter(x => !state.value.q || [x.item.name, x.item.en, x.item.es].some(n => n?.toLowerCase().includes(state.value.q.toLowerCase())))
  .sort((a, b) => name(a.item).localeCompare(name(b.item))))

// Each holder with its best spots: biggest hordes first (more holders per encounter), then single encounters.
const detail = ref<Record<number, SpeciesDetail>>({})
watch(() => [state.value.item, held.value] as const, async ([id]) => {
  for (const sp of held.value[id] ?? []) {
    if (!detail.value[sp]) loadData<SpeciesDetail>(`species/${sp}`).then(d => (detail.value = { ...detail.value, [sp]: d }), () => {})
  }
}, { immediate: true })
const holders = computed(() => (held.value[state.value.item] ?? []).map((id) => {
  const spots = (detail.value[id]?.locations ?? [])
    .filter((l, i, a) => a.findIndex(o => o.place === l.place && o.kind === l.kind && o.horde === l.horde) === i)
    .sort((a, b) => b.horde - a.horde)
  return { id, sp: species.value[id], spots: spots.slice(0, 4), more: Math.max(0, spots.length - 4), horde5: hordes.value.some(h => h.id === id && h.horde === 5) }
}).sort((a, b) => Number(b.horde5) - Number(a.horde5)))
</script>

<template>
  <NuxtLink
    to="/guides"
    class="back"
  >
    {{ $t('guides.back') }}
  </NuxtLink>
  <h1>{{ $t('guides.items.title') }}</h1>
  <p class="lead">
    {{ $t('guides.items.intro') }}
  </p>
  <p
    v-if="loadError"
    class="err"
    role="alert"
  >
    {{ $t('errors.dataLoad') }}
  </p>

  <div class="card tips">
    <strong>{{ $t('guides.items.howTitle') }}</strong>
    <span>{{ $t('guides.items.how') }}</span>
  </div>

  <h2>{{ $t('guides.items.pick') }}</h2>
  <input
    v-model="state.q"
    type="search"
    class="q"
    :placeholder="$t('common.search')"
    :aria-label="$t('common.search')"
  >
  <div class="items">
    <button
      v-for="x in list"
      :key="x.id"
      type="button"
      class="it"
      :aria-pressed="state.item === x.id"
      @click="state.item = x.id"
    >
      <img
        class="px"
        :src="itemIcon(x.item.icon)"
        alt=""
        width="24"
        height="24"
      >
      {{ name(x.item) }}
      <span class="muted">{{ held[x.id]!.length }}</span>
    </button>
  </div>

  <template v-if="items[state.item]">
    <h2>{{ $t('guides.items.holders', { item: name(items[state.item]) }) }}</h2>
    <div class="holders">
      <article
        v-for="h in holders"
        :key="h.id"
        class="card holder"
      >
        <span class="slot"><img
          class="px"
          :src="icon(h.id)"
          alt=""
          width="56"
          height="56"
        ></span>
        <div class="body">
          <NuxtLink
            :to="`/pokedex/${h.id}`"
            class="nm"
          >
            {{ name(h.sp) || h.id }}
          </NuxtLink>
          <ul v-if="h.spots.length">
            <li
              v-for="(l, i) in h.spots"
              :key="i"
            >
              {{ $t('guides.items.spot', { place: place(l.place), region: place(l.region), kind: kind(l.kind) }) }}
              <span
                v-if="l.horde"
                class="chip"
              >{{ $t('guides.items.horde', { n: l.horde }) }}</span>
            </li>
          </ul>
          <span
            v-else-if="detail[h.id]"
            class="muted"
          >{{ $t('guides.items.noWild') }}</span>
          <span
            v-if="h.more"
            class="muted small"
          >{{ $t('guides.items.more', { n: h.more }) }}</span>
        </div>
      </article>
    </div>
  </template>
  <p
    v-else
    class="muted"
  >
    {{ $t('guides.items.none') }}
  </p>
</template>

<style scoped>
.back { font-size: .9rem; }
.tips { display: flex; flex-direction: column; gap: 4px; font-size: .92rem; max-width: 80ch; }
.q { width: min(100%, 320px); margin-bottom: 10px; }
.items { display: flex; flex-wrap: wrap; gap: 6px; }
.it { display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 0 10px 0 6px; background: var(--surface); border: 1px solid var(--border); font-weight: 500; }
.it[aria-pressed="true"] { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
.it[aria-pressed="true"] .muted { color: inherit; }
.holders { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
.holder { display: flex; gap: 12px; align-items: flex-start; }
.holder .slot { width: 64px; height: 64px; }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; font-size: .88rem; }
.nm { font-weight: 700; font-size: 1rem; text-decoration: none; }
ul { margin: 0; padding-left: 16px; display: grid; gap: 2px; }
.small { font-size: .8rem; }
</style>
