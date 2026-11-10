<script setup lang="ts">
const { t, locale } = useI18n()
const { name } = useLoc()
usePageSeo(() => t('meta.title', { page: t('berries.title') }), () => t('home.berries'))
interface Plot { berry: string, icon: number, plantedAt: number, hours: number, place: string }
const plots = usePersisted<Plot[]>('pokemmo:berries', [])
// The game dump has no growth times, so the player enters them once per berry.
const growth = usePersisted<Record<string, number>>('pokemmo:berry-hours', {})

const berries = ref<Item[]>([])
onMounted(async () => {
  const items = await loadData<Record<number, Item>>('items')
  const seen = new Map<string, Item>()
  for (const it of Object.values(items)) if (it.name.startsWith('Baie ') && !seen.has(it.name)) seen.set(it.name, it)
  berries.value = [...seen.values()].sort((a, b) => name(a).localeCompare(name(b)))
})

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval>
onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 30_000)))
onUnmounted(() => clearInterval(timer))

const form = reactive({ berry: '', hours: 0, place: '', count: 1 })
watch(() => form.berry, b => (form.hours = growth.value[b] ?? form.hours))
const selected = computed(() => berries.value.find(b => b.name === form.berry))
function plant() {
  if (!selected.value || form.hours <= 0) return
  growth.value[form.berry] = form.hours
  for (let i = 0; i < Math.min(50, Math.max(1, form.count)); i++) {
    plots.value.push({ berry: form.berry, icon: selected.value.icon, plantedAt: Date.now(), hours: form.hours, place: form.place })
  }
}
const left = (p: Plot) => p.plantedAt + p.hours * 3_600_000 - now.value
const fmt = (ms: number) => {
  const m = Math.ceil(ms / 60_000)
  return m >= 60 ? t('berries.hours', { h: Math.floor(m / 60), m: m % 60 }) : t('berries.minutes', { m })
}
const sorted = computed(() => [...plots.value].sort((a, b) => left(a) - left(b)))
const remove = (p: Plot) => (plots.value = plots.value.filter(x => x !== p))
const plantedLine = (p: Plot) => t('berries.planted', {
  place: p.place || t('common.none'),
  date: new Date(p.plantedAt).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' }),
})
</script>

<template>
  <h1>{{ $t('berries.title') }}</h1>
  <p class="muted">
    {{ $t('berries.intro') }}
  </p>

  <form
    class="card row"
    @submit.prevent="plant"
  >
    <select
      v-model="form.berry"
      :aria-label="$t('berries.berry')"
      required
    >
      <option
        value=""
        disabled
      >
        {{ $t('berries.pick') }}
      </option>
      <option
        v-for="b in berries"
        :key="b.name"
      >
        {{ name(b) }}
      </option>
    </select>
    <label class="row">{{ $t('berries.growsIn') }} <input
      v-model.number="form.hours"
      type="number"
      min="0.5"
      step="0.5"
      required
      style="width: 80px"
    ></label>
    <label class="row">{{ $t('berries.count') }} <input
      v-model.number="form.count"
      type="number"
      min="1"
      max="50"
      style="width: 64px"
    ></label>
    <input
      v-model="form.place"
      :placeholder="$t('berries.place')"
      :aria-label="$t('berries.place')"
    >
    <button
      class="primary"
      :disabled="!selected || form.hours <= 0"
    >
      {{ $t('berries.plant') }}
    </button>
  </form>
  <p
    v-if="selected?.desc"
    class="muted"
  >
    {{ selected.desc }}
  </p>

  <div
    class="grid"
    style="--min: 240px; margin-top: 14px"
  >
    <div
      v-for="(p, i) in sorted"
      :key="i"
      class="card plot"
      :class="{ ready: left(p) <= 0 }"
    >
      <div class="row">
        <img
          class="px"
          :src="itemIcon(p.icon)"
          alt=""
          width="48"
          height="48"
        >
        <div>
          <strong>{{ p.berry }}</strong>
          <div class="muted">
            {{ plantedLine(p) }}
          </div>
        </div>
      </div>
      <div class="bar">
        <span :style="{ width: Math.min(100, 100 - (left(p) / (p.hours * 36_000))) + '%' }" />
      </div>
      <div class="row">
        <strong>{{ left(p) <= 0 ? $t('berries.ready') : $t('berries.left', { time: fmt(left(p)) }) }}</strong>
        <span style="flex: 1" />
        <button @click="remove(p)">
          {{ left(p) <= 0 ? $t('berries.harvested') : $t('common.remove') }}
        </button>
      </div>
    </div>
  </div>
  <p
    v-if="!plots.length"
    class="muted"
  >
    {{ $t('berries.none') }}
  </p>
</template>

<style scoped>
.plot { display: flex; flex-direction: column; gap: 8px; }
.plot.ready { border-color: var(--good); }
.bar { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--good); }
</style>
