<script setup lang="ts">
import type { Check } from '~/utils/guides'
import type { GuideRole } from '~/utils/guideRoles'

// Checks each team slot of a guide against the imported collection and shows the closest owned Pokémon.
const props = defineProps<{ roles: GuideRole[] }>()
const { t } = useI18n()
const { name, nature, monName } = useLoc()
const g$ = useGuideText()
const collection = useCollection()
const game = ref<Awaited<ReturnType<typeof loadGame>> | null>(null)
const loadError = ref(false)
onMounted(() => loadGame().then(g => (game.value = g), () => (loadError.value = true)))

const mons = computed(() => (collection.value ? BOXES.flatMap(box => collection.value![box].map(m => ({ ...m, box }))) : []))
const NONE = { species_id: 0, ivs: '0/0/0/0/0/0', nature_string_id: -1, ability_id: -1, held_item_id: -1, moves: [] }
const rows = computed(() => props.roles.map((role) => {
  const best = bestFor(role, mons.value)
  const checks = best?.checks ?? checkMon(role, NONE)
  return { role, best, checks, ok: !!best && checks.every(c => c.ok), met: best ? best.score : 0 }
}))
const readyCount = computed(() => rows.value.filter(r => r.ok).length)

function label(c: Check, role: GuideRole) {
  const g = game.value
  switch (c.kind) {
    case 'ability': return t('guides.check.ability', { name: name(g?.abilities[c.id]) || c.id })
    case 'nature': return t('guides.check.nature', { names: c.ids.map(nature).join(' / ') })
    case 'item': return c.id ? t('guides.check.item', { name: name(g?.items[c.id]) || g$(role.itemName) || c.id }) : t('guides.check.noItem')
    case 'move': return name(g?.moves[c.id]) || String(c.id)
    case 'iv': return t('guides.check.iv', { stat: t(`stats.${c.stat}`), min: c.min })
  }
}
</script>

<template>
  <p
    v-if="loadError"
    class="err"
    role="alert"
  >
    {{ $t('errors.dataLoad') }}
  </p>
  <p
    v-if="!collection"
    class="hint card"
  >
    {{ $t('guides.team.noCollection') }}
    <NuxtLink to="/collection">
      {{ $t('guides.team.import') }}
    </NuxtLink>
  </p>
  <p
    v-else
    class="summary"
  >
    <strong class="num">{{ $t('guides.team.ready', { n: readyCount, total: rows.length }) }}</strong>
    <span class="muted">{{ $t('guides.team.how') }}</span>
  </p>

  <div class="roles">
    <article
      v-for="r in rows"
      :key="r.role.id"
      class="card role"
      :class="{ ready: r.ok }"
    >
      <div class="head">
        <span class="slot"><img
          v-if="r.best || r.role.species"
          class="px"
          :src="icon(r.best?.mon.species_id ?? r.role.species![0]!, r.best?.mon.shiny)"
          alt=""
          width="56"
          height="56"
        ></span>
        <div class="who">
          <h3>{{ g$(r.role.title) }}</h3>
          <span
            v-if="r.best"
            class="muted"
          >{{ $t('guides.team.best', { name: monName(r.best.mon, game?.species.find(s => s.id === r.best!.mon.species_id)), level: r.best.mon.level, box: $t(`boxes.${r.best.mon.box}`) }) }}</span>
          <span
            v-else-if="collection"
            class="missing"
          >{{ $t('guides.team.missing') }}
            <NuxtLink
              v-if="r.role.species"
              :to="`/pokedex/${r.role.species[0]}`"
            >{{ $t('guides.team.where') }}</NuxtLink>
          </span>
        </div>
        <span
          v-if="collection && r.checks.length"
          class="score num"
        >{{ r.ok ? '✓' : `${r.met}/${r.checks.length}` }}</span>
      </div>
      <p class="muted text">
        {{ g$(r.role.text) }}
      </p>
      <ul class="checks">
        <li
          v-for="(c, i) in r.checks"
          :key="i"
          :class="r.best ? (c.ok ? 'ok' : 'ko') : ''"
        >
          <span aria-hidden="true">{{ r.best ? (c.ok ? '✓' : '✕') : '·' }}</span>
          {{ label(c, r.role) }}
        </li>
      </ul>
      <p
        v-if="r.best?.others"
        class="muted others"
      >
        {{ $t('guides.team.others', { n: r.best.others }, r.best.others) }}
      </p>
    </article>
  </div>
</template>

<style scoped>
.hint { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
.summary { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; margin: 0 0 12px; }
.roles { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
.role { display: flex; flex-direction: column; gap: 8px; }
.role.ready { border-color: var(--good); }
.head { display: flex; gap: 12px; align-items: center; }
.head .slot { width: 64px; height: 64px; }
.who { flex: 1; min-width: 0; display: flex; flex-direction: column; font-size: .88rem; }
.who h3 { margin: 0; font-size: 1.02rem; }
.missing { color: var(--bad); }
.score { font-weight: 700; padding: 2px 9px; border-radius: 999px; background: var(--surface-2); }
.ready .score { background: var(--good); color: #fff; }
.text { margin: 0; font-size: .88rem; }
.checks { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px; }
.checks li { font-size: .8rem; padding: 2px 8px; border-radius: 999px; background: var(--surface-2); }
.checks li.ok { background: color-mix(in srgb, var(--good) 20%, transparent); }
.checks li.ko { background: color-mix(in srgb, var(--bad) 18%, transparent); }
.others { margin: 0; font-size: .8rem; }
</style>
