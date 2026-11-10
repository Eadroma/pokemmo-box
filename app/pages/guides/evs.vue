<script setup lang="ts">
import type { Stat } from '~/utils/pokemon'
import type { Horde } from '~/utils/evs'

const { t } = useI18n()
useHead({ title: t('meta.title', { page: t('guides.evs.title') }) })

const hordes = ref<Horde[]>([])
const species = ref<Record<number, Species>>({})
const loadError = ref(false)
onMounted(() => Promise.all([loadData<Horde[]>('hordes'), loadData<Species[]>('species')])
  .then(([h, s]) => {
    hordes.value = h
    species.value = Object.fromEntries(s.map(x => [x.id, x]))
  }, () => (loadError.value = true)))

const ZERO: Record<Stat, number> = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
const state = usePersisted('pokemmo:guide:evs', { mon: '', target: { ...ZERO, atk: 252, spe: 252, hp: 4 }, brace: true, stat: 'spe' as Stat, region: '', season: '', farm: null as { stat: Stat, ev: number } | null })

// The Pokémon being trained: any mon of the imported collection, or none (start from 0).
const collection = useCollection()
const mons = computed(() => (collection.value
  ? BOXES.flatMap(box => collection.value![box].map((m, i) => ({ key: `${box}:${i}`, box, m })))
      .sort((a, b) => a.m.name.localeCompare(b.m.name))
  : []))
const picked = computed(() => mons.value.find(x => x.key === state.value.mon))
const exported = computed(() => (picked.value ? parseSpread(picked.value.m.evs) : ZERO))

// Live tracking on top of the exported EVs. A new import that changed this mon's EVs already contains the
// gains, so they reset (base = the EV string they were counted from).
const tracker = usePersisted<Record<string, { base: string, gained: Record<Stat, number> }>>('pokemmo:ev-tracker', {})
const track = computed(() => {
  const k = state.value.mon, base = picked.value?.m.evs ?? ''
  const cur = tracker.value[k]
  return cur && cur.base === base ? cur : null
})
const current = computed(() => {
  const out = { ...exported.value }
  let total = STATS.reduce((a, s) => a + out[s], 0)
  for (const s of STATS) {
    const add = Math.max(0, Math.min(track.value?.gained[s] ?? 0, EV_CAP - out[s], EV_TOTAL - total))
    out[s] += add
    total += add
  }
  return out
})
function gain(stat: Stat, n: number) {
  const k = state.value.mon
  const t = track.value ?? { base: picked.value?.m.evs ?? '', gained: { ...ZERO } }
  t.gained[stat] = Math.max(0, (t.gained[stat] ?? 0) + n)
  tracker.value = { ...tracker.value, [k]: { ...t } }
}
function resetTrack() {
  const { [state.value.mon]: _, ...rest } = tracker.value
  tracker.value = rest
}
const gainedTotal = computed(() => STATS.reduce((a, s) => a + (track.value?.gained[s] ?? 0), 0))
// EVs per horde for the tracker: the horde picked on the map ("Je farme ici"), else the best for the stat.
const farm = computed(() => (state.value.farm?.stat === state.value.stat ? state.value.farm.ev : bestPerStat.value[state.value.stat] ?? 0))

// Smogon Gen 5 spreads for the picked species.
const { name, place, kind, season } = useLoc()
const sets = ref<Record<number, SmogonSet[]>>({})
onMounted(() => loadData<Record<number, SmogonSet[]>>('sets').then(x => (sets.value = x), () => {}))
const monSets = computed(() => (picked.value ? sets.value[picked.value.m.species_id] ?? [] : []).filter(x => Object.keys(x.evs).length))
const applySet = (x: SmogonSet) => (state.value.target = { ...ZERO, ...x.evs } as Record<Stat, number>)

const PRESETS = [
  { key: 'physical', target: { ...ZERO, atk: 252, spe: 252, hp: 4 } },
  { key: 'special', target: { ...ZERO, spa: 252, spe: 252, hp: 4 } },
  { key: 'physWall', target: { ...ZERO, hp: 252, def: 252, spd: 4 } },
  { key: 'specWall', target: { ...ZERO, hp: 252, spd: 252, def: 4 } },
]
const targetTotal = computed(() => STATS.reduce((a, s) => a + (Number(state.value.target[s]) || 0), 0))

const REGIONS = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unys']
const SEASONS = ['Printemps', 'Été', 'Automne', 'Hiver']
const inFilters = (h: Horde) => (!state.value.region || h.region === state.value.region) && (!state.value.season || !!h.seasons[state.value.season])
// Hordes for the chosen stat, most EVs first, then biggest horde.
const list = computed(() => hordes.value
  .filter(h => h.ev[state.value.stat] && inFilters(h))
  .map(h => ({ h, ev: hordeEv(h, state.value.stat, state.value.brace) }))
  .sort((a, b) => b.ev - a.ev || b.h.horde - a.h.horde || a.h.place.localeCompare(b.h.place)))
const shown = ref(30)
watch(() => [state.value.stat, state.value.region, state.value.season], () => (shown.value = 30))

// For the plan: the best horde available per stat with the current filters.
const bestPerStat = computed(() => Object.fromEntries(STATS.map(s => [s, Math.max(0, ...hordes.value.filter(h => h.ev[s] && inFilters(h)).map(h => hordeEv(h, s, state.value.brace)))])))
const plan = computed(() => evPlan(current.value, state.value.target, bestPerStat.value))
const left = computed(() => plan.value.find(p => p.stat === state.value.stat)!.left)

// Clicked horde: shown in a dialog with its place on the schematic map.
const dlg = ref<HTMLDialogElement>()
const sel = ref<Horde | null>(null)
const spot = computed(() => sel.value && placeOf(sel.value.region, sel.value.place))
function open(h: Horde) {
  sel.value = h
  dlg.value?.showModal()
}
const TIMES = ['guides.evs.morning', 'guides.evs.day', 'guides.evs.night'] as const
</script>

<template>
  <NuxtLink
    to="/guides"
    class="back"
  >
    {{ $t('guides.back') }}
  </NuxtLink>
  <h1>{{ $t('guides.evs.title') }}</h1>
  <p class="lead">
    {{ $t('guides.evs.intro') }}
  </p>
  <p
    v-if="loadError"
    class="err"
    role="alert"
  >
    {{ $t('errors.dataLoad') }}
  </p>

  <div class="facts">
    <div class="card">
      <span class="k">{{ $t('guides.evs.capsTitle') }}</span>
      {{ $t('guides.evs.caps', { cap: EV_CAP, total: EV_TOTAL }) }}
    </div>
    <div class="card">
      <span class="k">{{ $t('guides.evs.braceTitle') }}</span>
      {{ $t('guides.evs.braceText') }}
    </div>
    <div class="card">
      <span class="k">{{ $t('guides.evs.howTitle') }}</span>
      {{ $t('guides.evs.howText') }}
    </div>
  </div>

  <h2>{{ $t('guides.evs.planTitle') }}</h2>
  <div class="card plan">
    <div class="row">
      <label class="field">
        {{ $t('guides.evs.mon') }}
        <select v-model="state.mon">
          <option value="">{{ $t('guides.evs.noMon') }}</option>
          <option
            v-for="x in mons"
            :key="x.key"
            :value="x.key"
          >
            {{ $t('guides.evs.monOption', { name: x.m.name, level: x.m.level, box: $t(`boxes.${x.box}`), evs: x.m.evs }) }}
          </option>
        </select>
      </label>
      <label class="check"><input
        v-model="state.brace"
        type="checkbox"
      > {{ $t('guides.evs.brace') }}</label>
    </div>
    <p
      v-if="!collection"
      class="muted small"
    >
      {{ $t('guides.team.noCollection') }}
      <NuxtLink to="/collection">
        {{ $t('guides.team.import') }}
      </NuxtLink>
    </p>
    <div class="row">
      <span class="muted small">{{ $t('guides.evs.presets') }}</span>
      <button
        v-for="p in PRESETS"
        :key="p.key"
        class="ghost"
        @click="state.target = { ...p.target }"
      >
        {{ $t(`guides.evs.preset.${p.key}`) }}
      </button>
    </div>
    <div
      v-if="monSets.length"
      class="row"
    >
      <span class="muted small">{{ $t('guides.evs.smogon') }}</span>
      <button
        v-for="(x, i) in monSets"
        :key="i"
        class="ghost"
        :title="STATS.filter(k => x.evs[k]).map(k => `${x.evs[k]} ${$t(`stats.${k}`)}`).join(' / ')"
        @click="applySet(x)"
      >
        {{ $t('guides.evs.smogonSet', { format: x.format.toUpperCase(), name: x.name }) }}
      </button>
    </div>
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th />
            <th>{{ $t('guides.evs.colNow') }}</th>
            <th>{{ $t('guides.evs.colTarget') }}</th>
            <th>{{ $t('guides.evs.colLeft') }}</th>
            <th>{{ $t('guides.evs.colHordes') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in plan"
            :key="p.stat"
            :class="{ sel: p.stat === state.stat }"
          >
            <th>
              <button
                class="statbtn"
                :aria-pressed="p.stat === state.stat"
                @click="state.stat = p.stat"
              >
                {{ $t(`stats.${p.stat}`) }}
              </button>
            </th>
            <td class="num">
              {{ p.current }}
            </td>
            <td>
              <input
                v-model.number="state.target[p.stat]"
                type="number"
                min="0"
                :max="EV_CAP"
                step="4"
                inputmode="numeric"
                :aria-label="$t('guides.evs.targetFor', { stat: $t(`stats.${p.stat}`) })"
              >
            </td>
            <td class="num">
              {{ p.left || '' }}
            </td>
            <td>
              <span
                v-if="p.hordes"
                class="num"
              >{{ $t('guides.evs.hordesN', { n: p.hordes }, p.hordes) }}</span>
              <span
                v-else-if="p.left"
                class="muted small"
              >{{ $t('guides.evs.noHorde') }}</span>
              <span
                v-if="p.berries"
                class="bad small"
              >{{ $t('guides.evs.berriesN', { n: p.berries, berry: $t(`guides.evs.berryName.${p.stat}`) }, p.berries) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p
      class="small"
      :class="targetTotal > EV_TOTAL ? 'bad' : 'muted'"
    >
      {{ $t('guides.evs.total', { n: targetTotal, max: EV_TOTAL }) }}
      <template v-if="targetTotal > EV_TOTAL">
        {{ $t('guides.evs.tooMany') }}
      </template>
    </p>
    <div class="row tracker">
      <strong>{{ $t('guides.evs.trackTitle') }}</strong>
      <button
        class="ghost"
        :disabled="!track?.gained[state.stat]"
        @click="gain(state.stat, -farm)"
      >
        -1
      </button>
      <button
        class="primary"
        :disabled="!farm"
        @click="gain(state.stat, farm)"
      >
        {{ $t('guides.evs.trackAdd', { n: farm, stat: $t(`stats.${state.stat}`) }) }}
      </button>
      <span class="muted small">{{ $t('guides.evs.trackGained', { n: gainedTotal }) }}</span>
      <button
        v-if="gainedTotal"
        class="ghost"
        @click="resetTrack"
      >
        {{ $t('guides.evs.trackReset') }}
      </button>
    </div>
    <p class="muted small">
      {{ state.mon ? $t('guides.evs.trackHelp') : $t('guides.evs.trackNoMon') }}
    </p>
  </div>

  <h2>{{ $t('guides.evs.whereTitle', { stat: $t(`stats.${state.stat}`) }) }}</h2>
  <div class="filters">
    <div
      class="tabs"
      role="tablist"
    >
      <button
        v-for="s in STATS"
        :key="s"
        role="tab"
        :aria-selected="state.stat === s"
        @click="state.stat = s"
      >
        {{ $t(`stats.${s}`) }}
      </button>
    </div>
    <div
      class="tabs"
      role="tablist"
    >
      <button
        role="tab"
        :aria-selected="!state.region"
        @click="state.region = ''"
      >
        {{ $t('guides.hells.allRegions') }}
      </button>
      <button
        v-for="r in REGIONS"
        :key="r"
        role="tab"
        :aria-selected="state.region === r"
        @click="state.region = r"
      >
        {{ place(r) }}
      </button>
    </div>
    <label class="field">
      {{ $t('guides.evs.season') }}
      <select v-model="state.season">
        <option value="">{{ $t('guides.evs.anySeason') }}</option>
        <option
          v-for="s in SEASONS"
          :key="s"
          :value="s"
        >{{ season(s) }}</option>
      </select>
    </label>
  </div>
  <p class="muted small">
    {{ $t('guides.evs.count', { n: list.length }) }}
  </p>

  <div class="hordes">
    <button
      v-for="{ h, ev } in list.slice(0, shown)"
      :key="`${h.id}${h.region}${h.place}${h.kind}${h.horde}`"
      type="button"
      class="card horde"
      @click="open(h)"
    >
      <span class="slot"><img
        class="px"
        :src="icon(h.id)"
        alt=""
        width="48"
        height="48"
      ></span>
      <div class="body">
        <div class="top">
          <strong>{{ name(species[h.id]) || h.id }}</strong>
          <span class="ev num">{{ $t('guides.evs.perHorde', { n: ev }) }}</span>
        </div>
        <span class="muted">{{ $t('guides.evs.place', { region: place(h.region), place: place(h.place), kind: kind(h.kind), size: h.horde }) }}</span>
        <span
          v-if="state.season"
          class="small"
        >
          <span
            v-for="(r, i) in h.seasons[state.season]"
            :key="i"
            class="time"
            :class="{ off: r === '--' }"
          >{{ $t(TIMES[i]!, { r }) }}</span>
        </span>
        <span
          v-else
          class="small muted"
        >{{ Object.keys(h.seasons).length === 4 ? $t('guides.evs.allYear') : SEASONS.filter(s => h.seasons[s]).map(season).join(' · ') }}</span>
        <span
          v-if="left && ev"
          class="small"
        >{{ $t('guides.evs.forYou', { n: Math.ceil(left / ev) }, Math.ceil(left / ev)) }}</span>
      </div>
    </button>
  </div>
  <button
    v-if="list.length > shown"
    class="ghost more"
    @click="shown += 30"
  >
    {{ $t('guides.evs.more') }}
  </button>

  <dialog
    ref="dlg"
    class="where"
    @close="sel = null"
    @click.self="dlg?.close()"
  >
    <div
      v-if="sel"
      class="card inner"
    >
      <div class="dhead">
        <span class="slot"><img
          class="px"
          :src="icon(sel.id)"
          alt=""
          width="48"
          height="48"
        ></span>
        <div>
          <h3>{{ name(species[sel.id]) || sel.id }}</h3>
          <span class="muted small">{{ $t('guides.evs.place', { region: place(sel.region), place: place(sel.place), kind: kind(sel.kind), size: sel.horde }) }}</span>
        </div>
        <button
          class="ghost close"
          :aria-label="$t('guides.evs.close')"
          @click="dlg?.close()"
        >
          ✕
        </button>
      </div>
      <SchematicMap
        v-if="spot"
        :map="spot.map"
        :pointer="spot.x !== undefined ? { x: spot.x, y: spot.y! } : undefined"
        :pointer-label="place(sel.place.replace(/ \(.*\)$/, ''))"
      />
      <p class="muted small">
        {{ spot?.x !== undefined ? $t('guides.mapNote') : $t('guides.evs.notPlaced') }}
      </p>
      <table class="seasons">
        <tbody>
          <tr
            v-for="s in SEASONS.filter(x => sel!.seasons[x])"
            :key="s"
          >
            <th>{{ season(s) }}</th>
            <td
              v-for="(r, i) in sel.seasons[s]"
              :key="i"
              :class="{ off: r === '--' }"
            >
              {{ $t(TIMES[i]!, { r }) }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="row">
        <button
          class="primary"
          @click="state.farm = { stat: state.stat, ev: hordeEv(sel, state.stat, state.brace) }; dlg?.close()"
        >
          {{ $t('guides.evs.farmHere', { n: hordeEv(sel, state.stat, state.brace) }) }}
        </button>
        <NuxtLink :to="`/pokedex/${sel.id}`">
          {{ $t('guides.evs.pokedex') }}
        </NuxtLink>
      </div>
    </div>
  </dialog>

  <h2>{{ $t('guides.evs.berriesTitle') }}</h2>
  <p class="muted">
    {{ $t('guides.evs.berriesText') }}
  </p>
  <div class="berries">
    <span
      v-for="s in STATS"
      :key="s"
      class="chip"
    >{{ $t('guides.evs.berry', { berry: $t(`guides.evs.berryName.${s}`), stat: $t(`stats.${s}`) }) }}</span>
  </div>

  <p class="muted credit">
    {{ $t('guides.evs.source') }}
  </p>
</template>

<style scoped>
.back { font-size: .9rem; }
.facts { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); }
.facts .card { display: flex; flex-direction: column; gap: 2px; font-size: .92rem; }
.k { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 650; }
.plan { display: grid; gap: 12px; }
.row, .filters { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
.field { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.field select { max-width: min(100%, 420px); }
.check { display: flex; gap: 8px; align-items: center; cursor: pointer; }
.small { font-size: .82rem; }
.bad { color: var(--bad); }
.tw { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: .92rem; }
th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid var(--border); }
thead th { font-size: .75rem; color: var(--muted); font-weight: 600; }
td input { width: 76px; }
tr.sel { background: color-mix(in srgb, var(--accent) 10%, transparent); }
.statbtn { background: none; padding: 2px 4px; min-height: 0; color: var(--text); font-weight: 650; }
td .bad { display: block; }
.filters { margin-bottom: 8px; }
.hordes { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
.horde { display: flex; gap: 12px; align-items: flex-start; padding: 12px; text-align: left; font: inherit; color: var(--text); min-height: 0; cursor: pointer; }
.horde:hover { border-color: var(--accent); }
.where { padding: 0; border: 0; background: none; width: min(560px, calc(100% - 32px)); max-height: calc(100dvh - 32px); }
.where::backdrop { background: rgb(0 0 0 / 55%); }
.inner { display: grid; gap: 10px; }
.dhead { display: flex; gap: 12px; align-items: center; }
.dhead > div { flex: 1; min-width: 0; }
.dhead h3 { margin: 0; }
.close { align-self: flex-start; }
.inner p { margin: 0; }
.seasons { font-size: .85rem; }
.seasons .off { color: var(--muted); text-decoration: line-through; }
.horde .slot { width: 56px; height: 56px; }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; font-size: .88rem; }
.top { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; font-weight: 650; }
.top a { text-decoration: none; }
.ev { flex: none; padding: 1px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-text); font-size: .78rem; }
.time { margin-right: 10px; }
.time.off { color: var(--muted); text-decoration: line-through; }
.more { margin-top: 12px; }
.berries { display: flex; flex-wrap: wrap; gap: 6px; }
.credit { font-size: .85rem; margin-top: 24px; }
.tracker { padding-top: 10px; border-top: 1px solid var(--border); }
</style>
