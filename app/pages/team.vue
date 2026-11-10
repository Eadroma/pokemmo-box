<script setup lang="ts">
import type { Box, BoxMon } from '~/composables/useCollection'

const { t } = useI18n()
const { name, nature, monName } = useLoc()
const route = useRoute()
usePageSeo(() => t('meta.title', { page: t('team.title') }), () => t('home.team'))
const collection = useCollection()
const { teams, current, team, add } = useTeams()
const game = ref<Awaited<ReturnType<typeof loadGame>> | null>(null)
const loadError = ref(false)
onMounted(() => loadGame().then(g => (game.value = g), () => (loadError.value = true)))
const speciesOf = (id: number) => game.value?.species.find(s => s.id === id)

// Share links: /team?t=<code> (utils/share.ts). Opening one shows the team; nothing is saved until "Add".
const shared = ref<{ name: string, members: BoxMon[] } | null>(null)
const badLink = ref(false)
onMounted(async () => {
  const code = route.query.t
  if (typeof code !== 'string') return
  shared.value = await decodeTeam(code)
  badLink.value = !shared.value
})
function keepShared() {
  teams.value.push({ name: shared.value!.name, members: shared.value!.members })
  current.value = teams.value.length - 1
  dropShared()
}
function dropShared() {
  shared.value = null
  badLink.value = false
  navigateTo('/team', { replace: true })
}
const linkCopied = ref(false)
async function copyLink() {
  const code = await encodeTeam(team.value.name, team.value.members)
  await navigator.clipboard.writeText(`${location.origin}/team?t=${code}`)
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 1500)
}

const LEVEL = 50 // PokeMMO PvP scales teams to level 50
const LEVITATE = 26
// Per-card view of the bars: computed stats at level 50, or the raw EVs / IVs.
type View = 'stats' | 'ev' | 'iv'
const views = ref<Record<number, View>>({})
const VIEWS: { key: View, label: string }[] = [{ key: 'stats', label: 'team.viewStats' }, { key: 'ev', label: 'stats.ev' }, { key: 'iv', label: 'stats.iv' }]

const nameOf = (i: number) => teams.value[i]?.name || t('team.defaultName', { n: i + 1 })
function newTeam() {
  teams.value.push({ name: '', members: [] })
  current.value = teams.value.length - 1
}
function deleteTeam() {
  teams.value.splice(current.value, 1)
  if (!teams.value.length) teams.value.push({ name: '', members: [] })
  current.value = Math.min(current.value, teams.value.length - 1)
}
const pick = ref('')
function addPicked() {
  const [k, i] = pick.value.split(':')
  const m = collection.value?.[k as Box]?.[Number(i)]
  if (m) add(m)
  pick.value = ''
}
function moveUp(i: number) {
  team.value.members.splice(i - 1, 0, team.value.members.splice(i, 1)[0]!)
}

const members = computed(() => {
  const g = game.value
  if (!g) return []
  return team.value.members.map((m) => {
    const sp = g.species.find(s => s.id === m.species_id)
    const nat = natureIndex(m)
    return {
      m, sp, types: sp?.types ?? [],
      stats: sp ? calcStats(sp.stats, parseSpread(m.ivs), parseSpread(m.evs), LEVEL, nat) : null,
      nature: natureEffect(nat),
      moves: m.moves.map(x => ({
        ...g.moves[x.move_id], name: name(g.moves[x.move_id]) || x.move_name,
        ...(x.move_id === HIDDEN_POWER ? { type: hiddenPowerType(parseSpread(m.ivs)) } : {}),
      })),
    }
  })
})

// shortcut: only Levitate is modelled; other immunity abilities (Absorb Eau, Torche…) are ignored.
const defense = computed(() => TYPES.map((ty) => {
  const mults = members.value.map(x => (ty === 'GROUND' && x.m.ability_id === LEVITATE ? 0 : effectiveness(ty, x.types)))
  return { ty, mults, weak: mults.filter(v => v > 1).length, resist: mults.filter(v => v < 1).length }
}))
const uncovered = computed(() => {
  const attackTypes = new Set(members.value.flatMap(x => x.moves.filter(mv => mv.cat !== 'Statut' && mv.power).map(mv => mv.type!)))
  return TYPES.filter(ty => Math.max(0, ...[...attackTypes].map(a => effectiveness(a, [ty]))) < 2)
})

const exportText = computed(() => (game.value ? team.value.members.map(m => monToShowdown(m, game.value!)).join('\n\n') : ''))
const copied = ref(false)
async function copyTeam() {
  await navigator.clipboard.writeText(exportText.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
const multLabel = (v: number) => (v === 1 ? '' : v === 0.25 ? '¼' : v === 0.5 ? '½' : `×${v}`)
</script>

<template>
  <h1>{{ $t('team.title') }}</h1>
  <p
    v-if="loadError"
    class="err"
    role="alert"
  >
    {{ $t('errors.dataLoad') }}
  </p>
  <p class="muted">
    {{ $t('team.level', { level: LEVEL }) }}
  </p>
  <p
    v-if="badLink"
    class="err"
    role="alert"
  >
    {{ $t('team.share.bad') }}
  </p>
  <div
    v-if="shared"
    class="card shared"
  >
    <strong>{{ $t('team.share.received', { name: shared.name || $t('team.defaultName', { n: teams.length + 1 }), n: shared.members.length }) }}</strong>
    <div class="row">
      <span
        v-for="(m, i) in shared.members"
        :key="i"
        class="slot"
        :title="monName(m, speciesOf(m.species_id))"
      ><img
        class="px"
        :src="icon(m.species_id, m.shiny)"
        :alt="monName(m, speciesOf(m.species_id))"
        width="48"
        height="48"
      ></span>
    </div>
    <div class="row">
      <button
        class="primary"
        @click="keepShared"
      >
        {{ $t('team.share.keep') }}
      </button>
      <button
        class="ghost"
        @click="dropShared"
      >
        {{ $t('team.share.drop') }}
      </button>
    </div>
  </div>

  <div class="row bar">
    <div
      class="tabs"
      role="tablist"
    >
      <button
        v-for="(tm, i) in teams"
        :key="i"
        role="tab"
        :aria-selected="i === current"
        @click="current = i"
      >
        {{ $t('team.tab', { name: nameOf(i), n: tm.members.length }) }}
      </button>
    </div>
    <button
      class="ghost"
      @click="newTeam"
    >
      {{ $t('team.new') }}
    </button>
  </div>
  <div class="row bar">
    <input
      v-model="team.name"
      :placeholder="nameOf(current)"
      :aria-label="$t('team.name')"
    >
    <select
      v-if="collection"
      v-model="pick"
      :aria-label="$t('team.addAria')"
      :disabled="team.members.length >= 6"
      @change="addPicked"
    >
      <option value="">
        {{ $t('team.add') }}
      </option>
      <optgroup
        v-for="k in BOXES"
        :key="k"
        :label="$t(`boxes.${k}`)"
      >
        <option
          v-for="(m, i) in collection[k]"
          :key="i"
          :value="`${k}:${i}`"
        >
          {{ $t(m.shiny ? 'team.optionShiny' : 'team.option', { name: monName(m, speciesOf(m.species_id)), level: m.level, nature: nature(natureIndex(m)) || m.nature_name, ivs: m.ivs }) }}
        </option>
      </optgroup>
    </select>
    <NuxtLink
      v-else
      to="/collection"
    >{{ $t('team.importFirst') }}</NuxtLink>
    <span style="flex: 1" />
    <button
      class="ghost"
      @click="deleteTeam"
    >
      {{ $t('team.delete') }}
    </button>
  </div>

  <div
    class="grid"
    style="--min: 280px; margin-top: 16px"
  >
    <div
      v-for="(x, i) in members"
      :key="i"
      class="card member"
    >
      <div class="row head">
        <span class="slot"><img
          class="px"
          :src="sprite(x.m.species_id, x.m.shiny)"
          alt=""
          width="96"
          height="96"
        ></span>
        <div>
          <strong>{{ monName(x.m, x.sp) }}</strong>
          <div class="row">
            <TypeBadge
              v-for="ty in x.types"
              :key="ty"
              :type="ty"
            />
          </div>
          <div class="muted">
            {{ nature(natureIndex(x.m)) || x.m.nature_name }} · {{ name(game?.abilities[x.m.ability_id]) || x.m.ability_name }}
          </div>
          <div
            v-if="x.m.held_item_id"
            class="muted"
          >
            {{ $t('common.held', { item: name(game?.items[x.m.held_item_id]) || x.m.held_item_name }) }}
          </div>
        </div>
      </div>
      <div
        class="tabs view"
        role="tablist"
        :aria-label="$t('team.viewLabel')"
      >
        <button
          v-for="v in VIEWS"
          :key="v.key"
          role="tab"
          :aria-selected="(views[i] ?? 'stats') === v.key"
          @click="views[i] = v.key"
        >
          {{ $t(v.label) }}
        </button>
      </div>
      <StatBars
        v-if="(views[i] ?? 'stats') === 'ev'"
        :values="parseSpread(x.m.evs)"
        :max="EV_CAP"
        :total-of="EV_TOTAL"
      />
      <StatBars
        v-else-if="views[i] === 'iv'"
        :values="parseSpread(x.m.ivs)"
        :max="31"
        :total-of="186"
      />
      <StatBars
        v-else-if="x.stats"
        :values="x.stats"
        :max="250"
        :plus="x.nature?.plus"
        :minus="x.nature?.minus"
      />
      <ul class="moves">
        <li
          v-for="(mv, j) in x.moves"
          :key="j"
        >
          <TypeBadge
            v-if="mv.type"
            :type="mv.type"
          /> {{ mv.name }} <span class="muted">{{ mv.power || '' }}</span>
        </li>
      </ul>
      <div class="row actions">
        <button
          class="ghost"
          :disabled="i === 0"
          :aria-label="$t('team.up')"
          @click="moveUp(i)"
        >
          ↑
        </button>
        <button
          class="ghost"
          @click="team.members.splice(i, 1)"
        >
          {{ $t('common.remove') }}
        </button>
      </div>
    </div>
  </div>
  <p
    v-if="!team.members.length"
    class="empty muted"
  >
    {{ $t('team.empty') }}
  </p>

  <template v-if="members.length">
    <h2>{{ $t('team.defense') }}</h2>
    <div class="card scroll-x">
      <table class="matrix">
        <thead>
          <tr>
            <th>{{ $t('team.attack') }}</th>
            <th
              v-for="(x, i) in members"
              :key="i"
            >
              <img
                class="px"
                :src="icon(x.m.species_id, x.m.shiny)"
                :alt="monName(x.m, x.sp)"
                width="36"
                height="36"
              >
            </th>
            <th>{{ $t('team.weak') }}</th><th>{{ $t('team.resist') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in defense"
            :key="r.ty"
          >
            <td><TypeBadge :type="r.ty" /></td>
            <td
              v-for="(v, i) in r.mults"
              :key="i"
              :class="v > 1 ? 'weak' : v < 1 ? 'res' : ''"
            >
              {{ multLabel(v) }}
            </td>
            <td :class="{ alert: r.weak >= 3 }">
              {{ r.weak || '' }}
            </td><td>{{ r.resist || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>{{ $t('team.coverage') }}</h2>
    <div class="card">
      <p v-if="!uncovered.length">
        {{ $t('team.allCovered') }}
      </p>
      <div
        v-else
        class="row"
      >
        <span class="muted">{{ $t('team.notCovered') }}</span>
        <TypeBadge
          v-for="ty in uncovered"
          :key="ty"
          :type="ty"
        />
      </div>
    </div>

    <h2>{{ $t('team.export') }}</h2>
    <div class="card">
      <textarea
        readonly
        :value="exportText"
        rows="12"
        :aria-label="$t('team.export')"
      />
      <div class="row">
        <button
          class="primary"
          @click="copyTeam"
        >
          {{ copied ? $t('common.copied') : $t('team.copy') }}
        </button>
        <button
          class="ghost"
          @click="copyLink"
        >
          {{ linkCopied ? $t('common.copied') : $t('team.share.copy') }}
        </button>
      </div>
    </div>
  </template>
</template>

<style scoped>
.bar { margin-top: 12px; }
.shared { display: grid; gap: 10px; margin-top: 12px; border-color: var(--accent); }
.shared .slot { width: 56px; height: 56px; }
.bar input { flex: 0 1 200px; }
.bar select { flex: 0 1 380px; }
.member { display: flex; flex-direction: column; gap: 12px; }
.head { gap: 14px; align-items: center; flex-wrap: nowrap; }
.head .slot { width: 104px; height: 104px; }
.head strong { font-size: 1.05rem; }
.head .row { margin: 4px 0; gap: 3px; }
.head .muted { font-size: .85rem; }
.actions { margin-top: auto; }
.view { align-self: flex-start; margin-bottom: -4px; }
.view button { min-height: 26px; padding: 0 12px; font-size: .8rem; }
.empty { border: 2px dashed var(--border); border-radius: var(--radius); padding: 40px 16px; text-align: center; }
.moves { list-style: none; padding: 0; margin: 0; display: grid; gap: 4px; font-size: .9rem; }
.moves :deep(.type) { min-width: 64px; margin-right: 6px; }
.matrix th, .matrix td { text-align: center; padding: 3px 6px; }
.matrix td:first-child { text-align: left; }
.matrix th { font-size: .78rem; }
.weak { background: color-mix(in srgb, var(--bad) 22%, transparent); font-weight: 650; }
.res { background: color-mix(in srgb, var(--good) 22%, transparent); }
.alert { color: var(--bad); font-weight: 700; }
textarea { width: 100%; font-family: ui-monospace, monospace; font-size: .85rem; margin-bottom: 10px; background: var(--well); border: 0; resize: vertical; }
</style>
