<script setup lang="ts">
const { t } = useI18n()
const { name } = useLoc()
usePageSeo(() => t('meta.title', { page: t('cosmetics.title') }), () => t('home.cosmetics'))

const all = ref<Cosmetic[]>([])
const loadError = ref(false)
onMounted(() => loadData<Cosmetic[]>('cosmetics').then(c => (all.value = c), () => (loadError.value = true)))
// Ids of the cosmetics the player ticked; kept in this browser only.
const owned = usePersisted<number[]>('pokemmo:cosmetics', [])
const ownedSet = computed(() => new Set(owned.value))
const toggle = (id: number) => (owned.value = ownedSet.value.has(id) ? owned.value.filter(x => x !== id) : [...owned.value, id])

// One tab per slot, in the game's slot order; the tab shows the slot's own icon.
const slots = computed(() => {
  const m = new Map<number, { slot: number, icon: number, n: number }>()
  for (const c of all.value) {
    const s = m.get(c.slot) ?? m.set(c.slot, { slot: c.slot, icon: c.icon, n: 0 }).get(c.slot)!
    s.n++
  }
  return [...m.values()].sort((a, b) => a.slot - b.slot)
})
const slot = ref(0), q = ref(''), show = ref<'all' | 'owned' | 'missing'>('all')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const list = computed(() => {
  const needle = norm(q.value.trim())
  return all.value.filter(c => (!slot.value || c.slot === slot.value)
    && (show.value === 'all' || ownedSet.value.has(c.id) === (show.value === 'owned'))
    && (!needle || norm(`${c.name} ${c.en ?? ''} ${c.es ?? ''}`).includes(needle)))
    .sort((a, b) => name(a).localeCompare(name(b)))
})
// The dump ships no icon for a couple of slots (tools): leave the slot empty rather than a broken image.
const hideImg = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')
const ownedCount = computed(() => all.value.filter(c => ownedSet.value.has(c.id)).length)
</script>

<template>
  <h1>{{ $t('cosmetics.title') }}</h1>
  <p class="lead">
    {{ $t('cosmetics.intro') }}
  </p>
  <p
    v-if="loadError"
    class="err"
    role="alert"
  >
    {{ $t('errors.dataLoad') }}
  </p>

  <template v-if="all.length">
    <div class="progress">
      <span class="num">{{ $t('cosmetics.progress', { n: ownedCount, total: all.length }) }}</span>
      <span class="track"><span :style="{ width: `${(ownedCount / all.length) * 100}%` }" /></span>
    </div>

    <div
      class="tabs slots"
      role="tablist"
    >
      <button
        role="tab"
        :aria-selected="slot === 0"
        @click="slot = 0"
      >
        {{ $t('cosmetics.allSlots', { n: all.length }) }}
      </button>
      <button
        v-for="s in slots"
        :key="s.slot"
        role="tab"
        :aria-selected="slot === s.slot"
        @click="slot = s.slot"
      >
        <img
          class="px"
          :src="itemIcon(s.icon)"
          alt=""
          width="24"
          height="24"
          @error="hideImg"
        >
        {{ $t('cosmetics.slotTab', { label: $t(`cosmetics.slot.${s.slot}`), n: s.n }) }}
      </button>
    </div>

    <div class="toolbar">
      <input
        v-model="q"
        type="search"
        :placeholder="$t('cosmetics.search')"
        :aria-label="$t('common.search')"
      >
      <select
        v-model="show"
        :aria-label="$t('cosmetics.show')"
      >
        <option value="all">
          {{ $t('cosmetics.showAll') }}
        </option>
        <option value="owned">
          {{ $t('cosmetics.showOwned') }}
        </option>
        <option value="missing">
          {{ $t('cosmetics.showMissing') }}
        </option>
      </select>
      <span class="muted num">{{ $t('cosmetics.count', { n: list.length }) }}</span>
    </div>

    <ul class="items">
      <li
        v-for="c in list"
        :key="c.id"
      >
        <label :class="{ owned: ownedSet.has(c.id) }">
          <span class="slot"><img
            class="px"
            :src="itemIcon(c.icon)"
            alt=""
            width="32"
            height="32"
            loading="lazy"
            @error="hideImg"
          ></span>
          <span class="names">
            <strong>{{ name(c) }}</strong>
            <span
              v-if="c.en && c.en !== name(c)"
              class="muted"
            >{{ c.en }}</span>
          </span>
          <input
            type="checkbox"
            :checked="ownedSet.has(c.id)"
            :aria-label="$t('cosmetics.have', { name: name(c) })"
            @change="toggle(c.id)"
          >
        </label>
      </li>
    </ul>
    <p
      v-if="!list.length"
      class="muted"
    >
      {{ $t('common.nothing') }}
    </p>
  </template>
</template>

<style scoped>
.slots { margin-bottom: 12px; }
.slots button { display: inline-flex; align-items: center; gap: 4px; }
.slots img { margin: -4px 0; }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
.toolbar input { flex: 1 1 240px; }
.items { list-style: none; padding: 0; margin: 0; display: grid; gap: 4px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); }
.items label { display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; border-radius: var(--radius-sm); cursor: pointer; }
.items label:hover { background: var(--surface); }
.items label.owned { background: color-mix(in srgb, var(--accent) 12%, transparent); }
.items .slot { width: 44px; height: 44px; }
.names { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.names strong { font-weight: 550; font-size: .92rem; }
.names .muted { font-size: .8rem; }
</style>
