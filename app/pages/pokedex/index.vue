<script setup lang="ts">
const { t } = useI18n()
const { name, place, egg: eggName } = useLoc()
usePageSeo(() => t('meta.title', { page: t('nav.pokedex') }), () => t('home.pokedex'))
const { data } = await useAsyncData('dex', async () => {
  const g = await loadGame()
  return { species: g.species, abilities: g.abilities, moves: Object.fromEntries(Object.entries(g.moves).map(([id, m]) => [id, { name: m.name, en: m.en, es: m.es }])) }
})

const q = ref(''), owned = ref<'' | 'owned' | 'missing'>(''), type1 = ref(''), type2 = ref(''), egg = ref(''), region = ref(''), horde = ref(0), tier = ref(''), ability = ref(''), obtainable = ref(true)
const moveInput = ref(''), moveIds = ref<number[]>([])

const options = computed(() => {
  const s = data.value?.species ?? []
  const uniq = (f: (x: Species) => string[]) => [...new Set(s.flatMap(f))].sort((a, b) => a.localeCompare(b))
  return { eggs: uniq(x => x.eggGroups), regions: uniq(x => x.regions), tiers: uniq(x => x.tiers) }
})
const abilityList = computed(() => Object.entries(data.value?.abilities ?? {}).filter(([id]) => id !== '0').sort((a, b) => name(a[1]).localeCompare(name(b[1]))))
// Any language's name finds the move.
const moveByName = computed(() => new Map(Object.entries(data.value?.moves ?? {}).flatMap(([id, m]) => [m.name, m.en, m.es].map(n => [n.toLowerCase(), Number(id)] as const))))

// Living-dex progress from the imported collection (client only: the list itself is prerendered).
const collection = useCollection()
const ownedIds = computed(() => new Set(collection.value ? BOXES.flatMap(b => collection.value![b].map(m => m.species_id)) : []))
const obtainableCount = computed(() => (data.value?.species ?? []).filter(s => s.obtainable).length)
const ownedCount = computed(() => (data.value?.species ?? []).filter(s => s.obtainable && ownedIds.value.has(s.id)).length)

// Learnsets are only needed for the move filter, so they're fetched on first use.
const learnsets = ref<Record<number, number[]> | null>(null)
function addMove() {
  const id = moveByName.value.get(moveInput.value.trim().toLowerCase())
  if (id == null || moveIds.value.includes(id) || moveIds.value.length >= 4) return
  moveIds.value.push(id)
  moveInput.value = ''
  loadData<Record<number, number[]>>('learnsets').then(l => (learnsets.value = l))
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const results = computed(() => (data.value?.species ?? []).filter(s =>
  (!q.value || [s.name, s.en, s.es].some(n => n && norm(n).includes(norm(q.value))) || String(s.id) === q.value)
  && (!owned.value || ownedIds.value.has(s.id) === (owned.value === 'owned'))
  && (!type1.value || s.types.includes(type1.value)) && (!type2.value || s.types.includes(type2.value))
  && (!egg.value || s.eggGroups.includes(egg.value)) && (!region.value || s.regions.includes(region.value))
  && (!horde.value || s.horde >= horde.value) && (!tier.value || s.tiers.includes(tier.value))
  && (!ability.value || s.abilities.includes(Number(ability.value))) && (!obtainable.value || s.obtainable)
  && (!moveIds.value.length || (!!learnsets.value && moveIds.value.every(m => learnsets.value![s.id]?.includes(m))))))

function reset() {
  q.value = owned.value = type1.value = type2.value = egg.value = region.value = tier.value = ability.value = ''
  horde.value = 0
  moveIds.value = []
}
</script>

<template>
  <h1>{{ $t('nav.pokedex') }}</h1>
  <div class="search">
    <input
      v-model="q"
      type="search"
      :placeholder="$t('pokedex.searchPlaceholder')"
      :aria-label="$t('common.search')"
    >
    <span class="muted num">{{ $t('pokedex.count', { n: results.length }) }}</span>
  </div>
  <ClientOnly>
    <div
      v-if="collection"
      class="progress dex"
    >
      <span>{{ $t('pokedex.progress', { n: ownedCount, total: obtainableCount }) }}</span>
      <span class="track"><span :style="{ width: `${(ownedCount / (obtainableCount || 1)) * 100}%` }" /></span>
      <select
        v-model="owned"
        :aria-label="$t('pokedex.owned')"
      >
        <option value="">
          {{ $t('pokedex.ownedAll') }}
        </option>
        <option value="missing">
          {{ $t('pokedex.ownedMissing') }}
        </option>
        <option value="owned">
          {{ $t('pokedex.ownedOwned') }}
        </option>
      </select>
    </div>
  </ClientOnly>
  <div class="filters">
    <select
      v-model="type1"
      :aria-label="$t('pokedex.type')"
    >
      <option value="">
        {{ $t('pokedex.type') }}
      </option>
      <option
        v-for="ty in TYPES"
        :key="ty"
        :value="ty"
      >
        {{ $t(`types.${ty}`) }}
      </option>
    </select>
    <select
      v-model="type2"
      :aria-label="$t('pokedex.type2')"
    >
      <option value="">
        {{ $t('pokedex.type2') }}
      </option>
      <option
        v-for="ty in TYPES"
        :key="ty"
        :value="ty"
      >
        {{ $t(`types.${ty}`) }}
      </option>
    </select>
    <select
      v-model="egg"
      :aria-label="$t('pokedex.eggGroup')"
    >
      <option value="">
        {{ $t('pokedex.eggGroup') }}
      </option>
      <option
        v-for="e in options.eggs"
        :key="e"
        :value="e"
      >
        {{ eggName(e) }}
      </option>
    </select>
    <select
      v-model="region"
      :aria-label="$t('pokedex.region')"
    >
      <option value="">
        {{ $t('pokedex.region') }}
      </option>
      <option
        v-for="r in options.regions"
        :key="r"
        :value="r"
      >
        {{ place(r) }}
      </option>
    </select>
    <select
      v-model.number="horde"
      :aria-label="$t('pokedex.horde')"
    >
      <option :value="0">
        {{ $t('pokedex.horde') }}
      </option>
      <option :value="3">
        {{ $t('pokedex.horde3') }}
      </option>
      <option :value="5">
        {{ $t('pokedex.horde5') }}
      </option>
    </select>
    <select
      v-model="tier"
      :aria-label="$t('pokedex.tier')"
    >
      <option value="">
        {{ $t('pokedex.tier') }}
      </option>
      <option
        v-for="ti in options.tiers"
        :key="ti"
      >
        {{ ti }}
      </option>
    </select>
    <select
      v-model="ability"
      :aria-label="$t('pokedex.ability')"
    >
      <option value="">
        {{ $t('pokedex.ability') }}
      </option>
      <option
        v-for="[id, a] in abilityList"
        :key="id"
        :value="id"
      >
        {{ name(a) }}
      </option>
    </select>
    <form
      class="row"
      @submit.prevent="addMove"
    >
      <input
        v-model="moveInput"
        list="moves"
        :placeholder="$t('pokedex.movePlaceholder')"
        :aria-label="$t('pokedex.move')"
        @change="addMove"
      >
      <datalist id="moves">
        <option
          v-for="(n, id) in data?.moves"
          :key="id"
          :value="name(n)"
        />
      </datalist>
    </form>
    <label class="row"><input
      v-model="obtainable"
      type="checkbox"
    > {{ $t('pokedex.obtainable') }}</label>
    <button
      class="ghost"
      @click="reset"
    >
      {{ $t('common.reset') }}
    </button>
  </div>
  <div
    v-if="moveIds.length"
    class="row"
    style="margin-top: 8px"
  >
    <span class="muted">{{ $t('pokedex.learns') }}</span>
    <button
      v-for="m in moveIds"
      :key="m"
      class="chip"
      @click="moveIds = moveIds.filter((x) => x !== m)"
    >
      {{ name(data?.moves[m]) }} ✕
    </button>
  </div>

  <div class="box">
    <NuxtLink
      v-for="s in results"
      :key="s.id"
      :to="`/pokedex/${s.id}`"
      class="mon"
    >
      <span
        class="slot"
        :class="{ have: ownedIds.has(s.id) }"
      ><img
        class="px"
        :src="icon(s.id)"
        alt=""
        width="72"
        height="72"
        loading="lazy"
      ></span>
      <span class="muted num id">{{ $t('pokedex.number', { id: s.id }) }}</span>
      <strong>{{ name(s) }}</strong>
      <span class="types">
        <TypeBadge
          v-for="ty in s.types"
          :key="ty"
          :type="ty"
        />
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.search { display: flex; gap: 16px; align-items: center; margin-top: 16px; }
.search input { flex: 1; min-height: 46px; font-size: 1rem; padding: 0 16px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
.filters select { flex: 1 1 130px; }
.filters form { flex: 1 1 200px; }
.search .muted { white-space: nowrap; }
.filters form input { width: 100%; }
.box { display: grid; gap: 6px; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); margin-top: 20px; }
.mon { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px 6px 12px; border-radius: var(--radius); text-decoration: none; }
.mon:hover { background: var(--surface); }
.mon .slot { width: 84px; height: 84px; margin-bottom: 6px; }
.mon strong { font-size: .9rem; line-height: 1.25; font-weight: 600; }
.id { font-size: .75rem; }
.types { display: flex; gap: 3px; margin-top: 5px; }
.types :deep(.type) { min-width: 0; }
.chip { border: 0; }
.dex { margin: 12px 0 0; flex-wrap: wrap; }
.dex select { margin-left: auto; }
.slot.have { box-shadow: inset 0 0 0 2px var(--good); }
</style>
