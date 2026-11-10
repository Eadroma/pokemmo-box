<script setup lang="ts">
const { t } = useI18n()
const { name, place, kind, season, egg, nature, rarity } = useLoc()
const route = useRoute()
const id = Number(route.params.id)

// Only what this page shows goes into its payload (not the whole data set).
const { data } = await useAsyncData(`dex-${id}`, async () => {
  const [g, detail] = await Promise.all([loadGame(), loadData<SpeciesDetail>(`species/${id}`)])
  const s = g.species.find(x => x.id === id)
  if (!s) return null
  // Names keep their en/es so the page can switch language without refetching.
  const names = Object.fromEntries(g.species.map(x => [x.id, { name: x.name, en: x.en, es: x.es }]))
  return {
    s, detail,
    abilities: [...new Set(s.abilities)].map(a => g.abilities[a] ?? { name: '?', en: null }),
    moves: detail.moves.map(m => ({ ...m, ...g.moves[m.id]! })),
    evolutions: detail.evolutions.map(e => ({ ...e, n: names[e.id] ?? { name: `#${e.id}`, en: null, es: null } })),
    held: detail.heldItems.map(h => g.items[h]).filter(Boolean) as Item[],
    prev: names[id - 1] ? { id: id - 1, n: names[id - 1]! } : null,
    next: names[id + 1] ? { id: id + 1, n: names[id + 1]! } : null,
  }
})
if (!data.value) throw createError({ statusCode: 404, message: t('pokedex.notFound') })
const d = computed(() => data.value!)
useHead({ title: () => t('meta.title', { page: name(d.value.s) }) })

// Smogon Gen 5 sets, fetched in the browser (not part of the prerendered payload).
const sets = ref<SmogonSet[]>([])
const game = ref<Awaited<ReturnType<typeof loadGame>> | null>(null)
onMounted(() => Promise.all([loadData<Record<number, SmogonSet[]>>('sets'), loadGame()]).then(([s, g]) => {
  sets.value = s[id] ?? []
  game.value = g
}, () => {}))
// A set value is a game id (shown in the current language) or an English name the game doesn't have.
const setName = (v: number | string, rec?: Record<number, { name: string, en?: string | null, es?: string | null }>) => (typeof v === 'number' ? name(rec?.[v]) || String(v) : v)
const setMove = (v: number | string) => {
  if (typeof v === 'string' && /^\d+:/.test(v)) {
    const [mid, ty] = v.split(':')
    return `${name(game.value?.moves[Number(mid)])} ${t(`types.${ty!.toUpperCase()}`)}`
  }
  return setName(v, game.value?.moves)
}
const setEvs = (x: SmogonSet) => STATS.filter(k => x.evs[k]).map(k => `${x.evs[k]} ${t(`stats.${k}`)}`).join(' / ')
const smogonUrl = computed(() => `https://www.smogon.com/dex/bw/pokemon/${d.value.s.en.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`)

const shiny = ref(false)
const SMOGON = 'Smogon' // site name, not translated
// PokeMMO-only moves (e.g. 883) are missing from moves.json: no category to show.
const catName = (c?: string) => (c ? t(`cats.${c.normalize('NFD').replace(/[^a-z]/gi, '')}`) : '')
// Game "how learned" values → i18n keys.
const HOW: Record<string, string> = { 'level': 'pokedex.how.level', 'CT??': 'pokedex.how.tm', 'TUTEUR': 'pokedex.how.tutor', 'ÉVOLUER': 'pokedex.how.evolution' }
const moveGroups = computed(() => {
  const groups: Record<string, typeof d.value.moves> = {}
  for (const m of d.value.moves) (groups[m.how] ??= []).push(m)
  groups.level?.sort((a, b) => (a.lvl ?? 0) - (b.lvl ?? 0))
  return groups
})
const weaknesses = computed(() => {
  const by: Record<number, string[]> = {}
  for (const ty of TYPES) {
    const e = effectiveness(ty, d.value.s.types)
    if (e !== 1) (by[e] ??= []).push(ty)
  }
  return Object.entries(by).map(([k, v]) => [Number(k), v] as const).sort((a, b) => b[0] - a[0])
})
const gender = computed(() => {
  const r = d.value.s.gender
  if (r >= 255) return t('pokedex.genderless')
  if (r === 254) return t('pokedex.female100')
  if (r === 0) return t('pokedex.male100')
  return t('pokedex.female', { p: (((r + 1) / 256) * 100).toFixed(1) })
})
const evYield = computed(() => Object.entries(d.value.s.evs).map(([k, n]) => t('pokedex.evPart', { n, stat: t(`stats.${GAME_STAT[k]}`) })).join(', ') || t('common.none'))
</script>

<template>
  <div class="row nav">
    <NuxtLink to="/pokedex">{{ $t('pokedex.back') }}</NuxtLink>
    <span style="flex: 1" />
    <NuxtLink
      v-if="d.prev"
      :to="`/pokedex/${d.prev.id}`"
    >‹ {{ name(d.prev.n) }}</NuxtLink>
    <NuxtLink
      v-if="d.next"
      :to="`/pokedex/${d.next.id}`"
    >{{ name(d.next.n) }} ›</NuxtLink>
  </div>

  <div class="head">
    <div class="slot art">
      <img
        class="px"
        :src="sprite(d.s.id, shiny)"
        :alt="name(d.s)"
        width="192"
        height="192"
      >
      <label class="row"><input
        v-model="shiny"
        type="checkbox"
      > {{ $t('common.shiny') }}</label>
    </div>
    <div>
      <div class="muted">
        {{ $t('pokedex.subtitle', { id: d.s.id, en: d.s.en }) }}
      </div>
      <h1>{{ name(d.s) }}</h1>
      <div class="row">
        <TypeBadge
          v-for="ty in d.s.types"
          :key="ty"
          :type="ty"
        />
      </div>
      <dl class="facts">
        <dt>{{ $t('pokedex.abilities') }}</dt><dd>{{ d.abilities.map(name).join(' / ') }}</dd>
        <dt>{{ $t('pokedex.eggGroups') }}</dt><dd>{{ d.s.eggGroups.map(egg).join(', ') }}</dd>
        <dt>{{ $t('pokedex.gender') }}</dt><dd>{{ gender }}</dd>
        <dt>{{ $t('pokedex.catchRate') }}</dt><dd>{{ d.s.catchRate }}</dd>
        <dt>{{ $t('pokedex.evYield') }}</dt><dd>{{ evYield }}</dd>
        <dt>{{ $t('pokedex.tier') }}</dt><dd>{{ d.s.tiers.join(', ') || $t('common.none') }}</dd>
        <template v-if="d.held.length">
          <dt>{{ $t('pokedex.heldItems') }}</dt>
          <dd class="row">
            <span
              v-for="h in d.held"
              :key="h.name"
              class="row"
            ><img
              class="px"
              :src="itemIcon(h.icon)"
              alt=""
              width="24"
              height="24"
            >{{ name(h) }}</span>
          </dd>
        </template>
      </dl>
    </div>
    <div class="card">
      <StatBars
        :values="baseStats(d.s.stats)"
        :max="180"
      />
    </div>
  </div>

  <h2>{{ $t('pokedex.weaknesses') }}</h2>
  <div class="card">
    <div
      v-for="[mult, types] in weaknesses"
      :key="mult"
      class="row weak"
    >
      <strong :class="mult > 1 ? 'bad' : 'good'">{{ $t('pokedex.mult', { n: mult }) }}</strong>
      <TypeBadge
        v-for="ty in types"
        :key="ty"
        :type="ty"
      />
    </div>
  </div>

  <template v-if="d.evolutions.length">
    <h2>{{ $t('pokedex.evolutions') }}</h2>
    <div class="row">
      <NuxtLink
        v-for="e in d.evolutions"
        :key="e.id"
        :to="`/pokedex/${e.id}`"
        class="card row evo"
      >
        <img
          class="px"
          :src="icon(e.id)"
          alt=""
          width="36"
          height="36"
        >
        <span><strong>{{ name(e.n) }}</strong><br><span class="muted">{{ e.type === 'LEVEL' ? $t('pokedex.evoLevel', { n: e.val }) : e.type.toLowerCase() }}</span></span>
      </NuxtLink>
    </div>
  </template>

  <template v-if="sets.length">
    <h2>{{ $t('pokedex.sets.title') }}</h2>
    <div class="sets">
      <article
        v-for="(x, i) in sets"
        :key="i"
        class="card set"
      >
        <header>
          <span class="chip">{{ x.format.toUpperCase() }}</span>
          <strong>{{ x.name }}</strong>
        </header>
        <dl class="facts">
          <template v-if="x.item.length">
            <dt>{{ $t('pokedex.sets.item') }}</dt><dd>{{ x.item.map(v => setName(v, game?.items)).join(' / ') }}</dd>
          </template>
          <template v-if="x.ability.length">
            <dt>{{ $t('pokedex.sets.ability') }}</dt><dd>{{ x.ability.map(v => setName(v, game?.abilities)).join(' / ') }}</dd>
          </template>
          <template v-if="x.nature.length">
            <dt>{{ $t('pokedex.sets.nature') }}</dt><dd>{{ x.nature.map(v => typeof v === 'number' ? nature(v) : v).join(' / ') }}</dd>
          </template>
          <template v-if="Object.keys(x.evs).length">
            <dt>{{ $t('pokedex.sets.evs') }}</dt><dd>{{ setEvs(x) }}</dd>
          </template>
        </dl>
        <ol class="setmoves">
          <li
            v-for="(slot, j) in x.moves"
            :key="j"
          >
            {{ slot.map(setMove).join(' / ') }}
          </li>
        </ol>
      </article>
    </div>
    <i18n-t
      keypath="pokedex.sets.source"
      tag="p"
      class="muted small"
    >
      <template #smogon>
        <a
          :href="smogonUrl"
          target="_blank"
          rel="noopener"
        >{{ SMOGON }}</a>
      </template>
    </i18n-t>
  </template>

  <h2>{{ $t('pokedex.where') }}</h2>
  <div
    v-if="d.detail.locations.length"
    class="card scroll-x"
  >
    <table>
      <thead>
        <tr>
          <th>{{ $t('pokedex.col.region') }}</th><th>{{ $t('pokedex.col.place') }}</th><th>{{ $t('pokedex.col.method') }}</th>
          <th>{{ $t('pokedex.col.levels') }}</th><th>{{ $t('pokedex.col.time') }}</th><th>{{ $t('pokedex.col.season') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(l, i) in d.detail.locations"
          :key="i"
        >
          <td>{{ place(l.region) }}</td><td>{{ place(l.place) }}</td>
          <td>
            {{ kind(l.kind) }} <span
              v-if="l.horde"
              class="chip"
            >{{ $t('pokedex.hordeChip', { n: l.horde }) }}</span>
          </td>
          <td>{{ $t('pokedex.levels', { min: l.min, max: l.max }) }}</td><td>{{ [...new Set(l.rarity)].map(rarity).join(' / ') }}</td><td>{{ season(l.season) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p
    v-else
    class="muted"
  >
    {{ $t('pokedex.noWild') }}
  </p>

  <h2>{{ $t('pokedex.moves') }}</h2>
  <div
    v-for="(moves, how) in moveGroups"
    :key="how"
    class="card scroll-x"
    style="margin-bottom: 10px"
  >
    <h3>{{ HOW[how] ? $t(HOW[how]) : how }}</h3>
    <table>
      <thead>
        <tr>
          <th v-if="how === 'level'">
            {{ $t('pokedex.col.lvl') }}
          </th><th>{{ $t('pokedex.col.move') }}</th><th>{{ $t('pokedex.col.type') }}</th>
          <th>{{ $t('pokedex.col.category') }}</th><th>{{ $t('pokedex.col.power') }}</th><th>{{ $t('pokedex.col.accuracy') }}</th><th>{{ $t('pokedex.col.pp') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="m in moves"
          :key="m.id + '-' + m.lvl"
        >
          <td v-if="how === 'level'">
            {{ m.lvl }}
          </td><td>{{ name(m) }}</td><td><TypeBadge :type="m.type" /></td>
          <td>{{ catName(m.cat) }}</td><td>{{ m.power || $t('common.none') }}</td><td>{{ m.acc || $t('common.none') }}</td><td>{{ m.pp }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.nav { margin-bottom: 20px; font-size: .9rem; }
.nav a { color: var(--muted); text-decoration: none; }
.nav a:hover { color: var(--text); }
.head { display: grid; gap: 16px; grid-template-columns: auto 1fr minmax(260px, 340px); align-items: start; }
@media (max-width: 800px) { .head { grid-template-columns: 1fr; } }
.art { padding: 12px 12px 10px; gap: 4px; }
.art label { font-size: .85rem; color: var(--muted); }
.facts { display: grid; grid-template-columns: max-content 1fr; gap: 4px 14px; margin: 14px 0 0; }
.facts dt { color: var(--muted); } .facts dd { margin: 0; }
.weak { padding: 4px 0; } .weak strong { width: 44px; }
.bad { color: var(--bad); } .good { color: var(--good); }
.evo { text-decoration: none; }
h3 { margin: 0 0 6px; font-size: 1rem; }
.sets { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.set header { display: flex; gap: 8px; align-items: center; }
.set .facts { margin-top: 10px; font-size: .9rem; }
.setmoves { margin: 10px 0 0; padding-left: 20px; font-size: .9rem; }
.small { font-size: .85rem; margin-top: 8px; }
</style>
