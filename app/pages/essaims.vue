<script setup lang="ts">
const { t } = useI18n()
usePageSeo(() => t('meta.title', { page: t('swarms.title') }), () => t('home.swarms'))
const { loadError, now, alphas, swarms, ended, moves, abilities, mon, fr, minutes, left, where } = useSpawns()
const { name } = useLoc()
const { list: watched, enabled, permission, toggle, enable } = useWatch()
const species = ref<Species[]>([])
onMounted(() => loadData<Species[]>('species').then(s => (species.value = s), () => {}))
const byId = computed(() => new Map(species.value.map(s => [s.id, s])))
// Typed name -> species id (any language), for the watch input's datalist.
const pick = ref('')
function addTyped() {
  const q = pick.value.trim().toLowerCase()
  const sp = species.value.find(s => [s.name, s.en, s.es].some(n => n?.toLowerCase() === q))
  if (sp && !watched.value.includes(sp.id)) toggle(sp.id)
  if (sp) pick.value = ''
}
const notifKey = computed(() => `watch.notif.${enabled.value && permission.value === 'granted' ? 'on' : permission.value === 'denied' ? 'denied' : permission.value === 'unsupported' ? 'unsupported' : 'off'}`)
</script>

<template>
  <h1>{{ $t('swarms.title') }}</h1>
  <i18n-t
    keypath="swarms.intro"
    tag="p"
    class="lead"
  >
    <template #source>
      <a
        :href="ALPHAPEDIA"
        target="_blank"
        rel="noopener"
      >{{ $t('swarms.source') }}</a>
    </template>
  </i18n-t>
  <p
    v-if="loadError"
    class="err"
    role="alert"
  >
    {{ $t('swarms.error') }}
  </p>

  <section class="card watch">
    <h2>{{ $t('watch.title') }}</h2>
    <p class="muted">
      {{ $t('watch.intro') }}
    </p>
    <form
      class="row"
      @submit.prevent="addTyped"
    >
      <input
        v-model="pick"
        list="watch-species"
        :placeholder="$t('watch.placeholder')"
        :aria-label="$t('watch.placeholder')"
      >
      <datalist id="watch-species">
        <option
          v-for="sp in species"
          :key="sp.id"
          :value="name(sp)"
        />
      </datalist>
      <button type="submit">
        {{ $t('watch.add') }}
      </button>
    </form>
    <div
      v-if="watched.length"
      class="chips"
    >
      <button
        v-for="id in watched"
        :key="id"
        type="button"
        class="chip watched"
        :aria-label="$t('watch.remove', { name: name(byId.get(id)) })"
        @click="toggle(id)"
      >
        <img
          class="px"
          :src="icon(id)"
          alt=""
          width="28"
          height="28"
        >{{ name(byId.get(id)) || id }} ✕
      </button>
    </div>
    <div class="row">
      <button
        v-if="permission !== 'unsupported' && permission !== 'denied' && !(enabled && permission === 'granted')"
        class="primary"
        :disabled="!watched.length"
        @click="enable"
      >
        {{ $t('watch.enable') }}
      </button>
      <button
        v-else-if="enabled && permission === 'granted'"
        class="ghost"
        @click="enabled = false"
      >
        {{ $t('watch.disable') }}
      </button>
      <span class="muted">{{ $t(notifKey) }}</span>
    </div>
  </section>

  <template
    v-for="group in [{ kind: 'alpha', list: alphas }, { kind: 'swarm', list: swarms }] as const"
    :key="group.kind"
  >
    <h2>{{ $t(`swarms.heading.${group.kind}`, { n: group.list.length }) }}</h2>
    <p
      v-if="!group.list.length"
      class="empty muted"
    >
      {{ $t(`swarms.none.${group.kind}`) }}
    </p>
    <div class="list">
      <article
        v-for="s in group.list"
        :key="s.id"
        class="card spawn"
        :class="s.kind"
      >
        <span class="slot"><img
          v-if="mon(s)"
          class="px"
          :src="icon(mon(s)!.id)"
          alt=""
          width="72"
          height="72"
        ></span>
        <div class="body">
          <div class="top">
            <NuxtLink
              v-if="mon(s)"
              :to="`/pokedex/${mon(s)!.id}`"
              class="name"
            >{{ name(mon(s)) }}</NuxtLink>
            <strong
              v-else
              class="name"
            >{{ s.pokemon }}</strong>
            <button
              v-if="mon(s)"
              type="button"
              class="star"
              :aria-pressed="watched.includes(mon(s)!.id)"
              :aria-label="$t('watch.star', { name: name(mon(s)) })"
              :title="$t('watch.star', { name: name(mon(s)) })"
              @click="toggle(mon(s)!.id)"
            >
              {{ watched.includes(mon(s)!.id) ? '★' : '☆' }}
            </button>
            <span class="time">{{ left(s) }}</span>
          </div>
          <div class="muted">
            {{ where(s) }}
          </div>
          <template v-if="s.kind === 'alpha'">
            <div v-if="s.ability">
              {{ $t('swarms.ability', { ability: fr(abilities, s.ability) }) }}
            </div>
            <div
              v-if="s.moves.length"
              class="chips"
            >
              <span
                v-for="m in s.moves"
                :key="m"
                class="chip"
              >{{ fr(moves, m) }}</span>
            </div>
            <div
              v-if="s.hms.length || s.locationNotes"
              class="muted"
            >
              {{ [s.hms.length ? $t('swarms.hms', { hms: s.hms.map((h) => fr(moves, h)).join(', ') }) : '', s.locationNotes].filter(Boolean).join(' · ') }}
            </div>
          </template>
          <div
            v-else-if="s.fastest || s.cheapest"
            class="balls"
          >
            <span v-if="s.fastest">{{ $t('swarms.fastest', { ball: s.fastest }) }}</span>
            <span v-if="s.cheapest">{{ $t('swarms.cheapest', { ball: s.cheapest }) }}</span>
          </div>
          <div
            v-if="s.notes.length"
            class="chips notes"
          >
            <span
              v-for="n in s.notes"
              :key="n"
              class="chip"
            >{{ n }}</span>
          </div>
          <div class="foot muted">
            <span v-if="s.by">{{ $t('swarms.by', { name: s.by }) }}</span>
            <a
              v-if="s.shareUrl"
              :href="s.shareUrl"
              target="_blank"
              rel="noopener"
            >{{ $t('swarms.open') }}</a>
          </div>
        </div>
      </article>
    </div>
  </template>

  <template v-if="ended.length">
    <h2>{{ $t('swarms.ended') }}</h2>
    <ul class="past">
      <li
        v-for="s in ended"
        :key="s.id"
      >
        <span class="muted num">{{ $t('swarms.ago', { m: minutes(now - s.endsAt) }) }}</span>
        <strong>{{ mon(s) ? name(mon(s)) : s.pokemon }}</strong>
        <span
          v-if="s.kind === 'alpha'"
          class="chip"
        >{{ $t('swarms.alphaChip') }}</span>
        <span class="muted">{{ where(s) }}</span>
        <a
          v-if="s.shareUrl"
          :href="s.shareUrl"
          target="_blank"
          rel="noopener"
        >{{ $t('swarms.open') }}</a>
      </li>
    </ul>
  </template>
</template>

<style scoped>
.watch { display: grid; gap: 10px; margin-bottom: 8px; }
.watch h2 { margin: 0; }
.watch p { margin: 0; }
.watch input { flex: 1 1 220px; }
.chip.watched { gap: 2px; padding-right: 10px; min-height: 0; cursor: pointer; }
.chip.watched img { margin: -6px 0; }
.star { background: none; min-height: 0; padding: 0 4px; font-size: 1.1rem; color: var(--muted); }
.star[aria-pressed="true"] { color: var(--accent); }
.lead a, .foot a, .past a { color: var(--text); }
.empty { border: 2px dashed var(--border); border-radius: var(--radius); padding: 28px 16px; text-align: center; }
.list { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
.spawn { display: flex; gap: 14px; align-items: flex-start; }
.spawn.alpha { border-color: color-mix(in srgb, var(--accent) 55%, var(--border)); }
.spawn .slot { width: 80px; height: 80px; }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; font-size: .9rem; }
.top { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.name { font-size: 1.05rem; font-weight: 650; text-decoration: none; }
.time { flex: none; padding: 1px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-text); font-weight: 650; font-size: .8rem; }
.balls { display: flex; flex-wrap: wrap; gap: 4px 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.notes .chip { background: color-mix(in srgb, var(--bad) 18%, transparent); }
.foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font-size: .8rem; margin-top: 2px; }
.foot a { white-space: nowrap; }
.past { list-style: none; padding: 0; margin: 0; display: grid; gap: 2px; font-size: .9rem; }
.past li { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; padding: 6px 0; border-bottom: 1px solid var(--border); }
.past li a { margin-left: auto; }
</style>
