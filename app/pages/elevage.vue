<script setup lang="ts">
import type { BoxMon } from '~/composables/useCollection'
import type { Stat } from '~/utils/pokemon'
import type { BreedNode } from '~/utils/breeding'

const { t } = useI18n()
useHead({ title: t('meta.title', { page: t('breeding.title') }) })
const picked = ref<Stat[]>(['hp', 'atk', 'def', 'spe'])
const withNature = ref(true)
const label = (a: string) => (a === 'nature' ? (target.value.species ? natureName(target.value.nature) : t('breeding.nature')) : t(`stats.${a}`))

function toggle(k: Stat) {
  picked.value = picked.value.includes(k) ? picked.value.filter(x => x !== k) : [...picked.value, k]
}
// Nature goes last: it can only be passed by an Everstone (see utils/breeding.ts).
const attrs = computed(() => [...picked.value, ...(withNature.value ? ['nature'] : [])])
const summary = computed(() => (attrs.value.length >= 2 ? breedSummary(attrs.value) : null))
// One tree object: the cover map is keyed by its nodes, so the rendered rows must be the same nodes.
const tree = computed(() => (attrs.value.length >= 2 ? breedTree(attrs.value) : null))

// From the collection: which of your mons already fill a node of the tree (see coverTree).
const { name, nature: natureName } = useLoc()
const collection = useCollection()
const target = usePersisted('pokemmo:breeding', { species: 0, nature: 13 })
const speciesList = ref<Species[]>([])
onMounted(() => loadData<Species[]>('species').then(s => (speciesList.value = s), () => {}))
const byId = computed(() => new Map(speciesList.value.map(s => [s.id, s])))
const sortedSpecies = computed(() => [...speciesList.value].filter(s => s.obtainable).sort((a, b) => name(a).localeCompare(name(b))))
const owned = computed(() => {
  const goal = byId.value.get(target.value.species)
  if (!collection.value || !goal) return []
  return BOXES.flatMap(box => collection.value![box].map(m => ({ m, box })))
    .filter(x => canBreed(goal.eggGroups, byId.value.get(x.m.species_id)?.eggGroups ?? []))
    .sort((a, b) => ivTotal(a.m) - ivTotal(b.m)) // spend your weakest matching mons first
})
const fromBox = computed(() => {
  if (!tree.value || !owned.value.length) return null
  const has = (x: { m: BoxMon }, a: string) => (a === 'nature' ? natureIndex(x.m) === target.value.nature : parseSpread(x.m.ivs)[a as Stat] === 31)
  return coverTree(tree.value, owned.value, has)
})
// Nodes below a covered one are not needed any more.
const skipped = computed(() => {
  const out = new Set<BreedNode>()
  const mark = (n?: BreedNode) => {
    if (!n) return
    out.add(n)
    mark(n.left)
    mark(n.right)
  }
  for (const n of fromBox.value?.cover.keys() ?? []) {
    mark(n.left)
    mark(n.right)
  }
  return out
})
const levels = computed(() => {
  if (!tree.value) return []
  const rows: BreedNode[][] = [[tree.value]]
  while (rows.at(-1)!.some(n => n.left)) rows.push(rows.at(-1)!.flatMap(n => (n.left ? [n.left, n.right!] : [])))
  return rows
})
</script>

<template>
  <h1>{{ $t('breeding.title') }}</h1>
  <p class="muted">
    {{ $t('breeding.intro') }}
  </p>

  <div class="card row">
    <span class="muted">{{ $t('breeding.ivs') }}</span>
    <button
      v-for="k in STATS"
      :key="k"
      :class="{ primary: picked.includes(k) }"
      :aria-pressed="picked.includes(k)"
      @click="toggle(k)"
    >
      {{ picked.includes(k) ? $t('breeding.order', { stat: label(k), n: picked.indexOf(k) + 1 }) : label(k) }}
    </button>
    <label class="row"><input
      v-model="withNature"
      type="checkbox"
    > {{ $t('breeding.nature') }}</label>
  </div>
  <div class="card row target">
    <label class="row">
      {{ $t('breeding.target') }}
      <select v-model.number="target.species">
        <option :value="0">{{ $t('breeding.anyTarget') }}</option>
        <option
          v-for="sp in sortedSpecies"
          :key="sp.id"
          :value="sp.id"
        >{{ name(sp) }}</option>
      </select>
    </label>
    <label
      v-if="withNature && target.species"
      class="row"
    >
      {{ $t('breeding.nature') }}
      <select v-model.number="target.nature">
        <option
          v-for="i in 25"
          :key="i"
          :value="i - 1"
        >{{ natureName(i - 1) }}</option>
      </select>
    </label>
    <span
      v-if="target.species && !collection"
      class="muted"
    >{{ $t('guides.team.noCollection') }} <NuxtLink to="/collection">{{ $t('guides.team.import') }}</NuxtLink></span>
    <strong
      v-else-if="fromBox"
      class="have"
    >{{ $t('breeding.fromBox', { have: fromBox.cover.size, missing: fromBox.missing }) }}</strong>
    <span
      v-else-if="target.species && collection"
      class="muted"
    >{{ $t('breeding.noneOwned') }}</span>
  </div>

  <template v-if="summary">
    <div
      class="grid"
      style="--min: 180px; margin-top: 14px"
    >
      <div class="card stat">
        <span class="big">{{ summary.parents }}</span> {{ $t('breeding.parents') }}
      </div>
      <div class="card stat">
        <span class="big">{{ summary.breeds }}</span> {{ $t('breeding.breeds') }}
      </div>
      <div class="card stat">
        <span class="big">{{ summary.braces }}</span> {{ $t('breeding.braces') }}
      </div>
      <div
        v-if="summary.everstones"
        class="card stat"
      >
        <span class="big">{{ summary.everstones }}</span> {{ $t('breeding.everstones') }}
      </div>
    </div>

    <h2>{{ $t('breeding.base') }}</h2>
    <div class="row">
      <span
        v-for="(n, a) in summary.leaves"
        :key="a"
        class="card"
      >
        {{ a === 'nature' ? $t('breeding.leafNature', { n }) : $t('breeding.leafIv', { n, stat: label(a) }) }}
      </span>
    </div>

    <h2>{{ $t('breeding.tree') }}</h2>
    <div class="card scroll-x">
      <div
        v-for="(row, i) in levels"
        :key="i"
        class="level"
      >
        <span
          v-for="(n, j) in row"
          :key="j"
          class="node"
          :class="{ leaf: !n.left, owned: fromBox?.cover.has(n), skip: skipped.has(n) }"
        >
          <template v-if="fromBox?.cover.get(n)">
            <img
              class="px"
              :src="icon(fromBox.cover.get(n)!.m.species_id, fromBox.cover.get(n)!.m.shiny)"
              alt=""
              width="28"
              height="28"
            >
            {{ $t('breeding.ownedNode', { name: fromBox.cover.get(n)!.m.name, box: $t(`boxes.${fromBox.cover.get(n)!.box}`) }) }}
          </template>
          {{ n.attrs.map(label).join(' · ') }}
        </span>
      </div>
    </div>
  </template>
  <p
    v-else
    class="muted"
    style="margin-top: 14px"
  >
    {{ $t('breeding.pickTwo') }}
  </p>
</template>

<style scoped>
.stat { font-size: .9rem; color: var(--muted); }
.big { display: block; font-size: 1.8rem; font-weight: 700; color: var(--text); }
.level { display: flex; gap: 6px; justify-content: center; padding: 6px 0; min-width: max-content; }
.node { padding: 4px 8px; border-radius: 8px; background: var(--surface-2); font-size: .78rem; white-space: nowrap; }
.node.leaf { border: 1px solid var(--accent); }
.node { display: inline-flex; align-items: center; gap: 4px; }
.node img { margin: -6px 0; }
.node.owned { background: color-mix(in srgb, var(--good) 22%, var(--surface-2)); border: 1px solid var(--good); font-weight: 650; }
.node.skip { opacity: .35; }
.target { margin-top: 10px; }
.target select { max-width: 220px; }
.have { color: var(--good); }
</style>
