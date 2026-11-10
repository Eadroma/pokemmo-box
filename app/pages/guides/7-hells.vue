<script setup lang="ts">
import { GYMS, PREP, REGIONS, URGENT } from '~/utils/sevenHells'

const { t } = useI18n()
const { place } = useLoc()
const g$ = useGuideText()
usePageSeo(() => t('meta.title', { page: t('guides.hells.title') }), () => t('guides.hells.card'))

// Progress and filters stay in this browser.
const state = usePersisted('pokemmo:guide:7hells', { done: [] as string[], cur: 'h2', region: '', hideOpt: false, prep: [] as string[], tab: 'route' })
const done = computed(() => new Set(state.value.done))
const regionOf = Object.fromEntries(REGIONS.map(r => [r.id, r]))
const visible = computed(() => GYMS.filter(g => (!state.value.region || g.region === state.value.region) && !(state.value.hideOpt && g.optional)))
const counted = computed(() => GYMS.filter(g => !(state.value.hideOpt && g.optional)))
const doneCount = computed(() => counted.value.filter(g => done.value.has(g.id)).length)
const index = computed(() => Math.max(0, visible.value.findIndex(g => g.id === state.value.cur)))
const gym = computed(() => visible.value[index.value])
const next = computed(() => visible.value[index.value + 1])
const lastOfRegion = computed(() => !!gym.value && next.value?.region !== gym.value.region)

// The current gym's region on the schematic map, its gyms numbered in route order.
const mapStops = computed(() => counted.value.filter(g => g.region === gym.value?.region).map(g => ({
  key: g.id, town: GYM_TOWN[g.id]!, label: g.num === '—' ? '0' : g.num,
  state: g.id === gym.value?.id ? 'current' as const : done.value.has(g.id) ? 'done' as const : 'todo' as const,
})))
const go = (id?: string) => id && (state.value.cur = id)
const setDone = (id: string, on: boolean) => (state.value.done = on ? [...new Set([...state.value.done, id])] : state.value.done.filter(x => x !== id))
function finish() {
  setDone(gym.value!.id, true)
  go(next.value?.id)
}
const resetRoute = () => (state.value.done = [])
const togglePrep = (k: string) => (state.value.prep = state.value.prep.includes(k) ? state.value.prep.filter(x => x !== k) : [...state.value.prep, k])

// Leads are written with the team's French names ("Ptéra ou Typhlosion"): show each one's sprite,
// and flag the ones missing from the imported collection.
const collection = useCollection()
const owned = computed(() => new Set(collection.value ? BOXES.flatMap(b => collection.value![b].map(m => m.species_id)) : []))
const SPECIES = Object.fromEntries(HELLS_TEAM.map(r => [r.name, r.species![0]!]))
const leadMons = (lead: string) => lead.split(' ou ').map(name => ({ name, id: SPECIES[name] }))

const q = ref('')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const urgent = computed(() => URGENT.filter(u => !q.value.trim() || norm(`${u.problem} ${u.who} ${u.fix} ${g$(u.problem)} ${g$(u.who)} ${g$(u.fix)}`).includes(norm(q.value.trim()))))

const TABS = ['route', 'team', 'prep', 'urgent'] as const
</script>

<template>
  <NuxtLink
    to="/guides"
    class="back"
  >
    {{ $t('guides.back') }}
  </NuxtLink>
  <h1>{{ $t('guides.hells.title') }}</h1>
  <p class="lead">
    {{ $t('guides.hells.intro') }}
  </p>
  <div class="progress">
    <span class="num">{{ $t('guides.hells.progress', { n: doneCount, total: counted.length }) }}</span>
    <span class="track"><span :style="{ width: `${(doneCount / counted.length) * 100}%` }" /></span>
  </div>

  <div
    class="tabs main-tabs"
    role="tablist"
  >
    <button
      v-for="tb in TABS"
      :key="tb"
      role="tab"
      :aria-selected="state.tab === tb"
      @click="state.tab = tb"
    >
      {{ $t(`guides.hells.tab.${tb}`) }}
    </button>
  </div>

  <section v-if="state.tab === 'route'">
    <div class="filters">
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
          :key="r.id"
          role="tab"
          :aria-selected="state.region === r.id"
          @click="state.region = r.id"
        >
          {{ g$(r.name) }}
        </button>
      </div>
      <label class="check"><input
        v-model="state.hideOpt"
        type="checkbox"
      > {{ $t('guides.hells.hideOptional') }}</label>
    </div>

    <div class="route">
      <nav class="rail">
        <template
          v-for="(g, i) in visible"
          :key="g.id"
        >
          <span
            v-if="g.region !== visible[i - 1]?.region"
            class="rhead"
            :class="g.region"
          >{{ place(regionOf[g.region]!.name) }}</span>
          <button
            class="gym"
            :class="{ isdone: done.has(g.id) }"
            :aria-current="g.id === gym?.id"
            @click="go(g.id)"
          >
            <span class="n num">{{ g.num }}</span>
            <span class="nm">{{ place(g.city) }}<small>{{ g.leads.map(g$).join(' + ') }}</small></span>
            <span
              v-if="done.has(g.id)"
              class="ok"
            >✓</span>
            <span
              v-else-if="g.optional"
              class="chip"
            >{{ $t('guides.hells.opt') }}</span>
          </button>
        </template>
        <p
          v-if="!visible.length"
          class="muted"
        >
          {{ $t('guides.hells.noGym') }}
        </p>
      </nav>

      <article
        v-if="gym"
        class="card detail"
        :class="gym.region"
      >
        <!-- Floated right: the title, opening and the next sections flow beside the region map. -->
        <figure class="minimap">
          <SchematicMap
            :map="gym.region"
            :stops="mapStops"
            @select="go"
          />
        </figure>
        <div>
          <span class="eyebrow">{{ $t(gym.optional ? 'guides.hells.gymOpt' : 'guides.hells.gym', { region: place(regionOf[gym.region]!.name), n: gym.num }) }}</span>
          <h2>{{ place(gym.city) }}</h2>
          <span class="muted">{{ gym.en }}</span>
        </div>
        <div class="sec">
          <h4>{{ $t('guides.hells.opening') }}</h4>
          <div class="leads">
            <template
              v-for="(l, i) in gym.leads"
              :key="l"
            >
              <span v-if="i">+</span>
              <span
                v-for="m in leadMons(l)"
                :key="m.name"
                class="lead-mon"
                :class="{ missing: collection && m.id && !owned.has(m.id) }"
                :title="collection && m.id && !owned.has(m.id) ? $t('guides.hells.notOwned') : undefined"
              >
                <img
                  v-if="m.id"
                  class="px"
                  :src="icon(m.id)"
                  alt=""
                  width="40"
                  height="40"
                >{{ g$(m.name) }}
              </span>
            </template>
          </div>
        </div>
        <div
          v-if="gym.base.length"
          class="sec"
        >
          <h4>{{ $t('guides.hells.plan') }}</h4>
          <ul>
            <li
              v-for="b in gym.base"
              :key="b"
            >
              {{ g$(b) }}
            </li>
          </ul>
        </div>
        <div
          v-if="gym.cases.length"
          class="sec"
        >
          <h4>{{ $t('guides.hells.cases') }}</h4>
          <div
            v-for="c in gym.cases"
            :key="c.when"
            class="case"
            :class="{ risk: c.risk }"
          >
            <span
              v-if="c.risk"
              class="k"
            >{{ $t('guides.hells.risky') }}</span>
            <strong>{{ g$(c.when) }}</strong>
            <ol v-if="c.steps.length > 1">
              <li
                v-for="s in c.steps"
                :key="s"
              >
                {{ g$(s) }}
              </li>
            </ol>
            <span v-else>{{ g$(c.steps[0]) }}</span>
          </div>
        </div>
        <div
          v-if="gym.notes.length"
          class="sec"
        >
          <h4>{{ $t('guides.hells.notes') }}</h4>
          <ul>
            <li
              v-for="n in gym.notes"
              :key="n"
            >
              {{ g$(n) }}
            </li>
          </ul>
        </div>
        <p
          v-if="gym.warn"
          class="note"
        >
          {{ g$(gym.warn) }}
        </p>
        <p
          v-if="lastOfRegion"
          class="cp"
        >
          <strong>{{ $t('guides.hells.endOf', { region: place(regionOf[gym.region]!.name) }) }}</strong>
          {{ g$(regionOf[gym.region]!.checkpoint) }}
        </p>
        <div class="nav2">
          <button
            class="ghost"
            :disabled="!index"
            @click="go(visible[index - 1]?.id)"
          >
            {{ $t('guides.hells.prev') }}
          </button>
          <div class="row">
            <button
              :class="{ good: done.has(gym.id) }"
              @click="setDone(gym.id, !done.has(gym.id))"
            >
              {{ done.has(gym.id) ? $t('guides.hells.isDone') : $t('guides.hells.markDone') }}
            </button>
            <button
              class="primary"
              @click="finish"
            >
              {{ next ? $t('guides.hells.finishNext') : $t('guides.hells.finishRoute') }}
            </button>
          </div>
        </div>
      </article>
    </div>
    <button
      class="ghost reset"
      :disabled="!state.done.length"
      @click="resetRoute"
    >
      {{ $t('guides.hells.resetRoute') }}
    </button>
  </section>

  <section v-else-if="state.tab === 'team'">
    <p class="muted">
      {{ $t('guides.hells.teamIntro') }}
    </p>
    <GuideTeam :roles="HELLS_TEAM" />
  </section>

  <section v-else-if="state.tab === 'prep'">
    <div class="prep">
      <div
        v-for="(p, pi) in PREP"
        :key="p.title"
        class="card"
      >
        <h3>
          {{ g$(p.title) }}
          <span class="muted num">{{ $t('guides.hells.count', { n: p.items.filter((_, xi) => state.prep.includes(`${pi}-${xi}`)).length, total: p.items.length }) }}</span>
        </h3>
        <label
          v-for="(x, xi) in p.items"
          :key="x"
          class="check row-check"
        >
          <input
            type="checkbox"
            :checked="state.prep.includes(`${pi}-${xi}`)"
            @change="togglePrep(`${pi}-${xi}`)"
          >
          <span>{{ g$(x) }}</span>
        </label>
      </div>
    </div>
  </section>

  <section v-else>
    <input
      v-model="q"
      type="search"
      class="search"
      :placeholder="$t('guides.hells.searchUrgent')"
    >
    <div class="urgent">
      <div
        v-for="u in urgent"
        :key="u.problem"
        class="card"
      >
        <strong>{{ g$(u.problem) }}</strong>
        <span class="muted">{{ g$(u.who) }}</span>
        <span>{{ g$(u.fix) }}</span>
      </div>
      <p
        v-if="!urgent.length"
        class="muted"
      >
        {{ $t('common.nothing') }}
      </p>
    </div>
  </section>

  <p class="muted credit">
    {{ $t('guides.hells.source') }}
  </p>
</template>

<style scoped>
.back { font-size: .9rem; }
.hoenn { --rc: #d9774b; } .kanto { --rc: #c99a3c; } .sinnoh { --rc: #6f7fd8; } .unova { --rc: #3fa877; } .johto { --rc: #c75b96; }
.main-tabs { margin: 8px 0 16px; }
.filters { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; }
.check { display: flex; gap: 8px; align-items: center; cursor: pointer; }
.route { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 20px; align-items: start; margin-top: 14px; }
@media (max-width: 760px) { .route { grid-template-columns: 1fr; } }
.rail { display: grid; gap: 2px; max-height: 75vh; overflow: auto; padding-right: 4px; }
@media (max-width: 760px) { .rail { max-height: 40vh; } }
.rhead { display: flex; gap: 8px; align-items: center; font-size: .75rem; font-weight: 650; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); padding: 10px 4px 2px; }
.rhead::before { content: ""; width: 10px; height: 10px; border-radius: 3px; background: var(--rc); }
.gym { display: grid; grid-template-columns: 30px 1fr auto; gap: 8px; align-items: center; text-align: left; width: 100%; padding: 6px 10px; border-radius: 9px; border: 1px solid transparent; background: none; color: var(--text); min-height: 0; font-weight: 400; }
.gym:hover { background: var(--surface-2); }
.gym[aria-current="true"] { background: var(--surface); border-color: var(--rc); }
.gym .n { color: var(--muted); font-size: .8rem; text-align: center; }
.nm { font-weight: 600; font-size: .9rem; line-height: 1.25; }
.nm small { display: block; font-weight: 400; color: var(--muted); font-size: .78rem; }
.gym.isdone .nm { text-decoration: line-through; text-decoration-color: var(--muted); }
.ok { color: var(--good); font-weight: 700; }
.detail { border-top: 4px solid var(--rc); min-width: 0; display: flow-root; }
.detail > * + * { margin-top: 16px; }
.detail > .minimap + * { margin-top: 0; }
.detail h2 { margin: 0; }
.eyebrow { font-size: .75rem; font-weight: 650; text-transform: uppercase; letter-spacing: .08em; color: var(--rc); }
.minimap { float: right; width: 220px; margin: 0 0 8px 20px; }
@media (max-width: 720px) { .minimap { float: none; width: min(100%, 300px); margin: 0 auto 12px; } }
.minimap figcaption { font-size: .78rem; }
.sec { display: grid; gap: 6px; }
.sec > * { min-width: 0; }
.sec h4 { margin: 0; font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.sec ul, .sec ol { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
.leads { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lead-mon { display: inline-flex; align-items: center; gap: 2px; padding: 2px 12px 2px 4px; border-radius: 999px; background: var(--surface-2); font-weight: 600; }
.lead-mon.missing { outline: 2px dashed var(--bad); }
.lead-mon img { margin: -4px 0; }
.case { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; display: grid; gap: 4px; }
.case.risk { border-color: var(--bad); }
.case .k { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--bad); font-weight: 650; }
.note, .cp { margin: 0; padding: 8px 12px; border-radius: 6px; background: var(--surface-2); border-left: 3px solid var(--accent); }
.cp { border-left-color: var(--good); }
.nav2 { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 14px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; }
button.good { background: color-mix(in srgb, var(--good) 22%, transparent); color: var(--good); }
.reset { margin-top: 14px; }
.prep { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
.prep h3 { margin: 0 0 6px; font-size: 1rem; display: flex; justify-content: space-between; gap: 8px; }
.row-check { align-items: flex-start; padding: 7px 0; border-bottom: 1px solid var(--border); }
.row-check:last-child { border-bottom: 0; }
.row-check input { margin-top: 3px; flex: none; }
.search { width: 100%; max-width: 420px; margin-bottom: 12px; }
.urgent { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.urgent .card { display: flex; flex-direction: column; gap: 4px; font-size: .92rem; }
.credit { font-size: .85rem; margin-top: 24px; }
</style>
