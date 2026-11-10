<script setup lang="ts">
const { t, locale } = useI18n()
const g$ = useGuideText()
useHead({ title: t('meta.title', { page: t('guides.rune.title') }) })

// Guide text in French, translated through useGuideText(); method from Eevelen's « Farmeo Amuleto » guide.
const STEPS = [
  'Doux Parfum pour lancer une horde de 5 Miaouss.',
  'Fouille montre si un Miaouss porte un objet. Aucun objet : fuis.',
  'Sinon, Sidérella lance Possessif : les Miaouss ne peuvent plus utiliser Hypnose, Machination ni Charme.',
  'Passe sur Dimoret pendant ce tour protégé.',
  'Les attaques de contact des Miaouss déclenchent Pickpocket, qui vole l’objet. Fuis, retire l’objet de Dimoret, recommence.',
]

// Session tracker, kept in this browser. `since` is set while the timer runs.
const session = usePersisted('pokemmo:guide:rune', { hordes: 0, coins: 0, claws: 0, ms: 0, since: null as number | null, price: 0 })
const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => (tick = setInterval(() => (now.value = Date.now()), 1000)))
onUnmounted(() => clearInterval(tick))
const elapsed = computed(() => session.value.ms + (session.value.since ? now.value - session.value.since : 0))
function toggleTimer() {
  const s = session.value
  if (s.since) {
    s.ms += Date.now() - s.since
    s.since = null
  }
  else s.since = Date.now()
}
const reset = () => (session.value = { ...session.value, hordes: 0, coins: 0, claws: 0, ms: 0, since: null })
const add = (k: 'hordes' | 'coins' | 'claws', n: number) => (session.value[k] = Math.max(0, session.value[k] + n))
const hours = computed(() => elapsed.value / 3_600_000)
const clock = computed(() => {
  const s = Math.floor(elapsed.value / 1000)
  return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const perHour = (n: number) => (hours.value > 0.01 ? Math.round(n / hours.value) : 0)
const yen = (n: number) => n.toLocaleString(locale.value)
const COUNTERS = [
  { k: 'hordes', label: 'guides.rune.hordes' },
  { k: 'coins', label: 'guides.rune.coins' },
  { k: 'claws', label: 'guides.rune.claws' },
] as const
</script>

<template>
  <NuxtLink
    to="/guides"
    class="back"
  >
    {{ $t('guides.back') }}
  </NuxtLink>
  <h1>{{ $t('guides.rune.title') }}</h1>
  <p class="lead">
    {{ $t('guides.rune.intro') }}
  </p>

  <div class="facts">
    <div class="card">
      <span class="k">{{ $t('guides.rune.where') }}</span>
      {{ $t('guides.rune.whereText') }}
    </div>
    <div class="card">
      <span class="k">{{ $t('guides.rune.when') }}</span>
      {{ $t('guides.rune.whenText') }}
    </div>
    <div class="card">
      <span class="k">{{ $t('guides.rune.loot') }}</span>
      {{ $t('guides.rune.lootText') }}
    </div>
  </div>

  <figure class="card sevii">
    <SchematicMap
      map="sevii"
      pointer="treasure"
      :pointer-label="$t('guides.rune.mapPointer')"
    />
    <figcaption class="muted">
      {{ $t('guides.rune.mapCaption') }} {{ $t('guides.mapNote') }}
    </figcaption>
  </figure>

  <h2>{{ $t('guides.team.title') }}</h2>
  <GuideTeam :roles="RUNE_TEAM" />

  <h2>{{ $t('guides.rune.method') }}</h2>
  <ol class="steps">
    <li
      v-for="s in STEPS"
      :key="s"
    >
      {{ g$(s) }}
    </li>
  </ol>
  <p class="note">
    {{ $t('guides.rune.note') }}
  </p>

  <h2>{{ $t('guides.rune.session') }}</h2>
  <div class="card session">
    <div class="timer">
      <span class="clock num">{{ clock }}</span>
      <button
        :class="{ primary: !session.since }"
        @click="toggleTimer"
      >
        {{ session.since ? $t('guides.rune.pause') : $t('guides.rune.start') }}
      </button>
      <button
        class="ghost"
        @click="reset"
      >
        {{ $t('common.reset') }}
      </button>
    </div>
    <div class="counters">
      <div
        v-for="c in COUNTERS"
        :key="c.k"
        class="counter"
      >
        <span class="muted">{{ $t(c.label) }}</span>
        <strong class="num">{{ session[c.k] }}</strong>
        <span class="muted num">{{ $t('guides.rune.perHour', { n: perHour(session[c.k]) }) }}</span>
        <div class="pm">
          <button
            :aria-label="$t('guides.rune.minus', { what: $t(c.label) })"
            @click="add(c.k, -1)"
          >
            -1
          </button>
          <button
            class="primary"
            :aria-label="$t('guides.rune.plus', { what: $t(c.label) })"
            @click="add(c.k, 1)"
          >
            +1
          </button>
        </div>
      </div>
    </div>
    <label class="price">
      {{ $t('guides.rune.price') }}
      <input
        v-model.number="session.price"
        type="number"
        min="0"
        step="1000"
        inputmode="numeric"
      >
    </label>
    <p
      v-if="session.price && session.coins"
      class="num"
    >
      {{ $t('guides.rune.earned', { total: yen(session.coins * session.price), rate: yen(perHour(session.coins * session.price)) }) }}
    </p>
    <p
      v-if="session.hordes"
      class="muted num"
    >
      {{ $t('guides.rune.ratio', { n: Math.round(session.coins / session.hordes * 100) }) }}
    </p>
  </div>

  <p class="muted credit">
    {{ $t('guides.rune.source') }}
  </p>
</template>

<style scoped>
.back { font-size: .9rem; }
.facts { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); }
.facts .card { display: flex; flex-direction: column; gap: 2px; font-size: .92rem; }
.sevii { margin: 12px 0 0; max-width: 520px; display: grid; gap: 6px; }
.sevii figcaption { font-size: .8rem; }
.k {font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 650; }
.steps { display: grid; gap: 6px; padding-left: 22px; max-width: 70ch; }
.note { border-left: 3px solid var(--accent); padding: 8px 12px; background: var(--surface-2); border-radius: 6px; max-width: 70ch; }
.session { display: grid; gap: 14px; }
.timer { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.clock { font: 600 1.8rem var(--display); margin-right: 8px; }
.counters { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr)); }
.counter { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--surface-2); }
.counter strong { font-size: 1.6rem; }
.pm { display: flex; gap: 6px; margin-top: 4px; }
.pm button { flex: 1; }
.price { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.price input { width: 140px; }
.session p { margin: 0; }
.credit { font-size: .85rem; margin-top: 24px; }
</style>
