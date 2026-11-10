<script setup lang="ts">
import type { Horde } from '~/utils/evs'

// Shiny hunt counter: encounters, odds with Donator / Shiny Charm (utils/shiny.ts), best hordes for the target.
const { t, locale } = useI18n()
useHead({ title: t('meta.title', { page: t('guides.shiny.title') }) })
const { name, place, kind, season } = useLoc()
const SOURCES = ['PokeMMO Wiki', 'Pikammo'] // site names, not translated

const species = ref<Species[]>([])
const hordes = ref<Horde[]>([])
onMounted(() => Promise.all([loadData<Species[]>('species'), loadData<Horde[]>('hordes')])
  .then(([s, h]) => {
    species.value = s
    hordes.value = h
  }, () => {}))
const byId = computed(() => new Map(species.value.map(s => [s.id, s])))

interface Hunt { species: number, count: number, size: number, found: number | null }
const state = usePersisted('pokemmo:guide:shiny', { donator: false, charm: false, hunts: [] as Hunt[], active: -1 })
const hunt = computed(() => state.value.hunts[state.value.active])
const rate = computed(() => shinyRate(state.value.donator, state.value.charm))
const pct = (p: number) => `${(p * 100).toLocaleString(locale.value, { maximumFractionDigits: 1 })} %`
const fmt = (n: number) => n.toLocaleString(locale.value)

const pick = ref('')
function start() {
  const q = pick.value.trim().toLowerCase()
  const sp = species.value.find(s => [s.name, s.en, s.es].some(n => n?.toLowerCase() === q))
  state.value.hunts.push({ species: sp?.id ?? 0, count: 0, size: 5, found: null })
  state.value.active = state.value.hunts.length - 1
  pick.value = ''
}
const add = (n: number) => hunt.value && (hunt.value.count = Math.max(0, hunt.value.count + n))
function remove(i: number) {
  state.value.hunts.splice(i, 1)
  state.value.active = Math.min(state.value.active, state.value.hunts.length - 1)
}
// Where to hunt: biggest hordes of the target first.
const spots = computed(() => hunt.value?.species ? hordes.value.filter(h => h.id === hunt.value!.species).sort((a, b) => b.horde - a.horde).slice(0, 6) : [])
</script>

<template>
  <NuxtLink
    to="/guides"
    class="back"
  >
    {{ $t('guides.back') }}
  </NuxtLink>
  <h1>{{ $t('guides.shiny.title') }}</h1>
  <p class="lead">
    {{ $t('guides.shiny.intro') }}
  </p>

  <div class="card odds">
    <label class="row"><input
      v-model="state.donator"
      type="checkbox"
    > {{ $t('guides.shiny.donator') }}</label>
    <label class="row"><input
      v-model="state.charm"
      type="checkbox"
    > {{ $t('guides.shiny.charm') }}</label>
    <strong class="rate">{{ $t('guides.shiny.rate', { n: fmt(rate) }) }}</strong>
    <span class="muted small">{{ $t('guides.shiny.median', { half: fmt(encountersFor(0.5, rate)), ninety: fmt(encountersFor(0.9, rate)) }) }}</span>
  </div>

  <h2>{{ $t('guides.shiny.hunts') }}</h2>
  <form
    class="row"
    @submit.prevent="start"
  >
    <input
      v-model="pick"
      list="shiny-species"
      :placeholder="$t('guides.shiny.target')"
      :aria-label="$t('guides.shiny.target')"
    >
    <datalist id="shiny-species">
      <option
        v-for="sp in species"
        :key="sp.id"
        :value="name(sp)"
      />
    </datalist>
    <button
      type="submit"
      class="primary"
    >
      {{ $t('guides.shiny.start') }}
    </button>
  </form>
  <div
    v-if="state.hunts.length"
    class="tabs hunts"
    role="tablist"
  >
    <button
      v-for="(h, i) in state.hunts"
      :key="i"
      role="tab"
      :aria-selected="i === state.active"
      @click="state.active = i"
    >
      <img
        v-if="h.species"
        class="px"
        :src="icon(h.species, !!h.found)"
        alt=""
        width="28"
        height="28"
      >
      {{ $t('guides.shiny.tab', { name: name(byId.get(h.species)) || $t('guides.shiny.any'), n: fmt(h.count) }) }}
    </button>
  </div>

  <div
    v-if="hunt"
    class="card counter"
  >
    <div class="big">
      <span class="slot"><img
        v-if="hunt.species"
        class="px"
        :src="sprite(hunt.species, !!hunt.found)"
        alt=""
        width="96"
        height="96"
      ></span>
      <div>
        <span class="n num">{{ fmt(hunt.count) }}</span>
        <span class="muted">{{ $t('guides.shiny.encounters') }}</span>
        <strong v-if="hunt.found">{{ $t('guides.shiny.found', { date: new Date(hunt.found).toLocaleDateString(locale) }) }}</strong>
        <span v-else>{{ $t('guides.shiny.chance', { p: pct(chanceSeen(hunt.count, rate)) }) }}</span>
      </div>
    </div>
    <div
      v-if="!hunt.found"
      class="row"
    >
      <button
        class="primary"
        @click="add(hunt.size)"
      >
        {{ $t('guides.shiny.addHorde', { n: hunt.size }) }}
      </button>
      <button @click="add(1)">
        {{ $t('guides.shiny.addOne') }}
      </button>
      <button
        class="ghost"
        :disabled="!hunt.count"
        @click="add(-hunt.size)"
      >
        {{ $t('guides.shiny.undo', { n: hunt.size }) }}
      </button>
      <label class="row">
        {{ $t('guides.shiny.size') }}
        <select v-model.number="hunt.size">
          <option :value="5">5</option>
          <option :value="3">3</option>
          <option :value="1">1</option>
        </select>
      </label>
    </div>
    <div class="row">
      <button
        v-if="!hunt.found"
        class="ghost"
        @click="hunt.found = Date.now()"
      >
        {{ $t('guides.shiny.gotIt') }}
      </button>
      <button
        class="ghost"
        @click="remove(state.active)"
      >
        {{ $t('guides.shiny.delete') }}
      </button>
    </div>

    <template v-if="spots.length">
      <h3>{{ $t('guides.shiny.where') }}</h3>
      <ul class="spots">
        <li
          v-for="(h, i) in spots"
          :key="i"
        >
          {{ $t('guides.items.spot', { place: place(h.place), region: place(h.region), kind: kind(h.kind) }) }}
          <span class="chip">{{ $t('guides.items.horde', { n: h.horde }) }}</span>
          <span class="muted small">{{ Object.keys(h.seasons).length === 4 ? $t('guides.evs.allYear') : Object.keys(h.seasons).map(season).join(' · ') }}</span>
        </li>
      </ul>
    </template>
    <p
      v-else-if="hunt.species"
      class="muted small"
    >
      {{ $t('guides.shiny.noHorde') }}
    </p>
  </div>

  <i18n-t
    keypath="guides.shiny.source"
    tag="p"
    class="muted credit"
  >
    <template #wiki>
      <a
        href="https://pokemmo.shoutwiki.com/wiki/Shiny_Pok%C3%A9mon"
        target="_blank"
        rel="noopener"
      >{{ SOURCES[0] }}</a>
    </template>
    <template #pikammo>
      <a
        href="https://www.pikammo.fr/Pokemmo/guide/shiny-hunting"
        target="_blank"
        rel="noopener"
      >{{ SOURCES[1] }}</a>
    </template>
  </i18n-t>
</template>

<style scoped>
.back { font-size: .9rem; }
.odds { display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center; }
.rate { font-size: 1.1rem; }
.small { font-size: .82rem; }
form input { flex: 1 1 220px; max-width: 360px; }
.hunts { margin: 12px 0; }
.hunts button { display: inline-flex; align-items: center; gap: 2px; }
.hunts img { margin: -6px 0; }
.counter { display: grid; gap: 12px; }
.big { display: flex; gap: 16px; align-items: center; }
.big .slot { width: 104px; height: 104px; }
.big > div { display: flex; flex-direction: column; }
.n { font: 600 3rem/1 var(--display); }
.counter h3 { margin: 4px 0 0; font-size: 1rem; }
.spots { margin: 0; padding-left: 18px; display: grid; gap: 4px; font-size: .9rem; }
.credit { font-size: .85rem; margin-top: 24px; }
</style>
