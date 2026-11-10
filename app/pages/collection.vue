<script setup lang="ts">
import type { BoxMon, Box } from '~/composables/useCollection'

import type { AuditTag } from '~/utils/audit'

const { t, te } = useI18n()
const { name, nature, monName } = useLoc()
const g$ = useGuideText()
usePageSeo(() => t('meta.title', { page: t('collection.title') }), () => t('home.collection'))
const collection = useCollection()
const { team, current, add } = useTeams()
const game = ref<Awaited<ReturnType<typeof loadGame>> | null>(null)
const error = ref(''), busy = ref(false), dragging = ref(false)
const sets = ref<Record<number, SmogonSet[]>>({})
onMounted(() => {
  loadGame().then(g => (game.value = g), () => (error.value = t('errors.dataLoad')))
  loadData<Record<number, SmogonSet[]>>('sets').then(s => (sets.value = s), () => {})
})
const speciesOf = computed(() => new Map(game.value?.species.map(s => [s.id, s])))
// Box audit: what each mon is good for (utils/audit.ts).
const ROLES = [...RUNE_TEAM, ...HELLS_TEAM]
const tagsOf = (m: BoxMon) => auditMon(m, ROLES, sets.value[m.species_id])
const audit = ref<'' | AuditTag['kind']>('')
const tagText = (g: AuditTag) => g.kind === 'ready' ? t('collection.audit.ready', { role: g$(g.role) }) : g.kind === 'parent' ? t('collection.audit.parent', { n: g.n }) : g.kind === 'smogon' ? t('collection.audit.smogon', { set: g.set }) : t('collection.audit.release')
// Open on the first box that has something in it (the party is often empty in an export).
const firstFull = () => BOXES.find(k => collection.value?.[k].length) ?? 'party'
async function onFile(file?: File) {
  if (!file) return
  error.value = ''
  busy.value = true
  try {
    collection.value = await parseImport(file)
    box.value = firstFull()
  }
  catch (e) {
    const msg = (e as Error).message
    error.value = te(msg) ? t(msg) : msg
  }
  finally { busy.value = false }
}

const box = ref<Box>(firstFull()), q = ref(''), shinyOnly = ref(false), sort = ref<'slot' | 'iv' | 'level' | 'name'>('slot')
const list = computed(() => {
  const l = [...(collection.value?.[box.value] ?? [])].filter(m =>
    (!shinyOnly.value || m.shiny) && (!audit.value || tagsOf(m).some(g => g.kind === audit.value))
    && (!q.value || `${m.name} ${m.species_name} ${name(speciesOf.value.get(m.species_id))}`.toLowerCase().includes(q.value.toLowerCase())))
  if (sort.value === 'iv') l.sort((a, b) => ivTotal(b) - ivTotal(a))
  if (sort.value === 'level') l.sort((a, b) => b.level - a.level)
  if (sort.value === 'name') l.sort((a, b) => name(speciesOf.value.get(a.species_id)).localeCompare(name(speciesOf.value.get(b.species_id))))
  return l
})

const copied = ref<BoxMon | null>(null)
async function copy(m: BoxMon) {
  if (!game.value) return
  await navigator.clipboard.writeText(monToShowdown(m, game.value))
  copied.value = m
  setTimeout(() => copied.value === m && (copied.value = null), 1500)
}
const teamFull = computed(() => team.value.members.length >= 6)
const teamName = computed(() => team.value.name || t('team.defaultName', { n: current.value + 1 }))
// File paths, not prose: identical in every language.
const ZIP_PATH = String.raw`PokeMMO\dump\resources\dump.zip`
const JSON_PATH = 'data/monsters.json'
const ivs = (m: BoxMon) => m.ivs.split('/').map(Number)
</script>

<template>
  <h1>{{ $t('collection.title') }}</h1>

  <label
    class="drop"
    :class="{ dragging, compact: collection }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="dragging = false; onFile($event.dataTransfer?.files[0])"
  >
    <input
      type="file"
      accept=".zip,.json"
      class="sr"
      @change="onFile(($event.target as HTMLInputElement).files?.[0])"
    >
    <strong>{{ busy ? $t('collection.reading') : collection ? $t('collection.reimport') : $t('collection.drop') }}</strong>
    <i18n-t
      v-if="!collection"
      keypath="collection.help"
      tag="span"
      class="muted"
    >
      <template #zip><code>{{ ZIP_PATH }}</code></template>
      <template #json><code>{{ JSON_PATH }}</code></template>
    </i18n-t>
    <span
      v-else
      class="muted"
    >{{ $t('collection.importedAt', { date: new Date(collection.importedAt).toLocaleString($i18n.locale) }) }}</span>
    <span
      v-if="error"
      class="err"
      role="alert"
    >{{ error }}</span>
  </label>

  <template v-if="collection">
    <div class="toolbar">
      <div
        class="tabs"
        role="tablist"
      >
        <button
          v-for="k in BOXES"
          :key="k"
          role="tab"
          :aria-selected="box === k"
          @click="box = k"
        >
          {{ $t('boxes.tab', { label: $t(`boxes.${k}`), n: collection[k].length }) }}
        </button>
      </div>
      <input
        v-model="q"
        type="search"
        :placeholder="$t('common.search')"
        :aria-label="$t('common.search')"
      >
      <select
        v-model="sort"
        :aria-label="$t('collection.sort')"
      >
        <option value="slot">
          {{ $t('collection.sortSlot') }}
        </option>
        <option value="iv">
          {{ $t('collection.sortIv') }}
        </option>
        <option value="level">
          {{ $t('collection.sortLevel') }}
        </option>
        <option value="name">
          {{ $t('collection.sortName') }}
        </option>
      </select>
      <select
        v-model="audit"
        :aria-label="$t('collection.audit.label')"
      >
        <option value="">
          {{ $t('collection.audit.all') }}
        </option>
        <option
          v-for="k in (['ready', 'parent', 'smogon', 'release'] as const)"
          :key="k"
          :value="k"
        >
          {{ $t(`collection.audit.filter.${k}`) }}
        </option>
      </select>
      <label class="row"><input
        v-model="shinyOnly"
        type="checkbox"
      > {{ $t('common.shiny') }}</label>
      <button
        class="ghost"
        @click="collection = null"
      >
        {{ $t('collection.clear') }}
      </button>
    </div>

    <div class="mons">
      <article
        v-for="(m, i) in list"
        :key="i"
        class="card mon"
      >
        <header>
          <span class="slot"><img
            class="px"
            :src="icon(m.species_id, m.shiny)"
            alt=""
            width="72"
            height="72"
          ></span>
          <div>
            <h3>
              {{ monName(m, speciesOf.get(m.species_id)) }}
              <span
                v-if="m.shiny"
                class="chip shiny"
              >{{ $t('common.shinyChip') }}</span>
              <span
                v-if="m.alpha"
                class="chip"
              >{{ $t('common.alpha') }}</span>
            </h3>
            <div class="muted">
              {{ m.name !== m.species_name ? $t('collection.speciesLevel', { species: name(speciesOf.get(m.species_id)) || m.species_name, level: m.level }) : $t('collection.level', { level: m.level }) }}
            </div>
            <div class="muted">
              {{ $t('collection.natureAbility', { nature: nature(natureIndex(m)) || m.nature_name, ability: name(game?.abilities[m.ability_id]) || m.ability_name }) }}
            </div>
            <div
              v-if="m.held_item_id"
              class="muted"
            >
              {{ $t('common.held', { item: name(game?.items[m.held_item_id]) || m.held_item_name }) }}
            </div>
          </div>
        </header>
        <div
          v-if="tagsOf(m).length"
          class="tags"
        >
          <span
            v-for="(g, j) in tagsOf(m)"
            :key="j"
            class="chip"
            :class="g.kind"
          >{{ tagText(g) }}</span>
        </div>

        <div class="spread num">
          <div
            v-for="(k, j) in STATS"
            :key="k"
            class="cell"
          >
            <span class="lbl">{{ $t(`stats.${k}`) }}</span>
            <span
              class="iv"
              :class="{ max: ivs(m)[j] === 31, zero: ivs(m)[j] === 0 }"
            >{{ ivs(m)[j] }}</span>
            <span class="ev">{{ m.evs.split('/')[j] }}</span>
          </div>
          <div class="cell total">
            <span class="lbl">{{ $t('stats.total') }}</span>
            <span class="iv">{{ ivTotal(m) }}</span>
            <span class="ev">{{ $t('stats.ev') }}</span>
          </div>
        </div>

        <ul class="moves">
          <li
            v-for="(x, j) in m.moves"
            :key="j"
          >
            {{ name(game?.moves[x.move_id]) || x.move_name }}
          </li>
        </ul>

        <footer>
          <button
            :disabled="!game"
            @click="copy(m)"
          >
            {{ copied === m ? $t('common.copied') : $t('collection.copyShowdown') }}
          </button>
          <button
            class="ghost"
            :disabled="teamFull"
            @click="add(m)"
          >
            {{ $t('collection.addTo', { team: teamName, n: team.members.length }) }}
          </button>
        </footer>
      </article>
    </div>
    <p
      v-if="!list.length"
      class="muted"
    >
      {{ $t('common.nothing') }}
    </p>
  </template>
</template>

<style scoped>
.drop { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 16px 0 24px; padding: 36px 20px; text-align: center; cursor: pointer; border: 2px dashed var(--border); border-radius: var(--radius); }
.drop:hover, .drop.dragging { border-color: var(--accent); }
.drop .muted { max-width: 60ch; font-size: .9rem; }
.drop.compact { flex-flow: row wrap; justify-content: flex-start; gap: 4px 12px; padding: 12px 16px; margin: 8px 0 20px; border-width: 1px; text-align: left; }
.sr { position: absolute; width: 1px; height: 1px; opacity: 0; }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
.toolbar input[type="search"] { flex: 1 1 180px; }
.mons { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.mon { display: flex; flex-direction: column; gap: 14px; }
.mon header { display: flex; gap: 14px; align-items: flex-start; }
.mon .slot { width: 80px; height: 80px; }
.mon h3 { margin: 0 0 2px; font-size: 1.05rem; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.mon header .muted { font-size: .85rem; line-height: 1.4; }
.tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: -6px; }
.chip.ready { background: color-mix(in srgb, var(--good) 25%, var(--surface-2)); }
.chip.parent { background: color-mix(in srgb, var(--cool) 22%, var(--surface-2)); }
.chip.smogon { background: color-mix(in srgb, var(--accent) 30%, var(--surface-2)); }
.chip.release { color: var(--muted); }
.chip.shiny { background: color-mix(in srgb, var(--accent) 25%, transparent); }
.spread { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cell { display: flex; flex-direction: column; align-items: center; padding: 5px 0; border-radius: 8px; background: var(--surface-2); }
.cell.total { background: transparent; }
.lbl { font-size: .68rem; color: var(--muted); white-space: nowrap; }
.iv { font-weight: 650; font-size: .95rem; }
.iv.max { color: var(--good); }
.iv.zero { color: var(--bad); }
.ev { font-size: .72rem; color: var(--muted); }
.moves { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: .88rem; }
.moves li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mon footer { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
.mon footer button { flex: 1 1 auto; white-space: nowrap; }
</style>
