<script setup lang="ts">
// Schematic region map (see utils/regionMaps.ts): roads in grey, an optional numbered route, an optional arrow.
import type { MapStop } from '~/utils/regionMaps'

// pointer: a town id, or any point on the map (encounter places).
const props = defineProps<{ map: string, stops?: MapStop[], pointer?: string | { x: number, y: number }, pointerLabel?: string }>()
const emit = defineEmits<{ select: [key: string] }>()
const { place } = useLoc()

const m = computed(() => MAPS[props.map]!)
const at = computed(() => Object.fromEntries(m.value.towns.map(t => [t.id, t])))
const stopTowns = computed(() => new Set((props.stops ?? []).map(s => s.town)))
// Several gyms can share a town (Ogoesse has three): one marker per town, the most relevant state wins.
const markers = computed(() => {
  const by = new Map<string, MapStop & { labels: string[] }>()
  for (const s of props.stops ?? []) {
    const cur = by.get(s.town)
    if (!cur) by.set(s.town, { ...s, labels: [s.label] })
    else {
      cur.labels.push(s.label)
      if (s.state === 'current' || (s.state === 'todo' && cur.state === 'done')) Object.assign(cur, { key: s.key, state: s.state })
    }
  }
  return [...by.values()]
})
const route = computed(() => (props.stops ?? []).map(s => at.value[s.town]!).filter((t, i, a) => t !== a[i - 1]).map(t => `${t.x},${t.y}`).join(' '))
const arrowId = useId()
const pin = computed(() => {
  const p = typeof props.pointer === 'string' ? at.value[props.pointer] : props.pointer
  // Arrow and label go on the side with room: from the right for points on the left half, and the reverse.
  return p && { x: p.x, y: p.y, dir: p.x > 55 ? -1 : 1 }
})
</script>

<template>
  <svg
    class="map"
    viewBox="-6 -8 112 114"
    role="img"
  >
    <defs>
      <marker
        :id="arrowId"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      ><path
        d="M0 0 L10 5 L0 10 z"
        class="head"
      /></marker>
    </defs>
    <rect
      x="-6"
      y="-8"
      width="112"
      height="114"
      rx="4"
      class="land"
    />
    <rect
      v-for="(w, i) in m.water"
      :key="i"
      v-bind="{ x: w.x, y: w.y, width: w.w, height: w.h }"
      rx="6"
      class="water"
    />
    <ellipse
      v-for="(s, i) in m.islands"
      :key="`isle${i}`"
      :cx="s.x"
      :cy="s.y"
      :rx="s.rx"
      :ry="s.ry"
      class="island"
    />
    <line
      v-for="[a, b] in m.roads"
      :key="a + b"
      :x1="at[a]!.x"
      :y1="at[a]!.y"
      :x2="at[b]!.x"
      :y2="at[b]!.y"
      class="road"
    />
    <polyline
      v-if="stops?.length"
      :points="route"
      class="route"
    />
    <template
      v-for="t in m.towns"
      :key="t.id"
    >
      <template v-if="!stopTowns.has(t.id)">
        <circle
          :cx="t.x"
          :cy="t.y"
          :r="t.small ? 1.2 : 1.8"
          class="town"
        />
        <text
          :x="t.x"
          :y="t.y - 3"
          class="name"
          :class="{ small: t.small, hit: t.id === pointer }"
        >{{ place(t.name) }}</text>
      </template>
    </template>
    <g
      v-for="s in markers"
      :key="s.town"
      class="stop"
      :class="s.state"
      role="button"
      tabindex="0"
      @click="emit('select', s.key)"
      @keydown.enter="emit('select', s.key)"
    >
      <title>{{ place(at[s.town]!.name) }}</title>
      <circle
        :cx="at[s.town]!.x"
        :cy="at[s.town]!.y"
        r="3.6"
      />
      <text
        :x="at[s.town]!.x"
        :y="at[s.town]!.y + 1.3"
        class="num"
      >{{ s.state === 'done' ? '✓' : s.labels[0] }}</text>
      <text
        :x="at[s.town]!.x"
        :y="at[s.town]!.y - 5.2"
        class="name"
      >{{ place(at[s.town]!.name) }}</text>
    </g>
    <g v-if="pin">
      <circle
        :cx="pin.x"
        :cy="pin.y"
        r="2.2"
        class="spot"
      />
      <line
        :x1="pin.x + 22 * pin.dir"
        :y1="pin.y + 2"
        :x2="pin.x + 4 * pin.dir"
        :y2="pin.y"
        class="arrow"
        :marker-end="`url(#${arrowId})`"
      />
      <text
        :x="pin.x + 23 * pin.dir"
        :y="pin.y + 3.4"
        class="pointer"
        :text-anchor="pin.dir > 0 ? 'start' : 'end'"
      >{{ pointerLabel }}</text>
    </g>
  </svg>
</template>

<style scoped>
.map { width: 100%; max-height: 300px; display: block; }
.land { fill: var(--surface-2); }
.water { fill: color-mix(in srgb, var(--cool) 16%, transparent); }
.island { fill: color-mix(in srgb, var(--surface-2) 88%, var(--good)); }
.road { stroke: var(--border); stroke-width: 1.1; stroke-linecap: round; }
.route { fill: none; stroke: var(--accent); stroke-width: .9; stroke-dasharray: 2 1.6; stroke-linejoin: round; opacity: .8; }
.town { fill: var(--muted); }
.name { font-size: 3.1px; fill: var(--text); text-anchor: middle; font-weight: 600; paint-order: stroke; stroke: var(--surface-2); stroke-width: .9px; }
.name.small { font-size: 2.6px; fill: var(--muted); font-weight: 500; }
.name.hit { font-size: 3.4px; fill: var(--text); font-weight: 700; }
.stop { cursor: pointer; }
.stop circle { fill: var(--surface); stroke: var(--muted); stroke-width: .6; }
.stop .num { font-size: 3.2px; text-anchor: middle; font-weight: 700; fill: var(--text); }
.stop.done circle { fill: var(--good); stroke: var(--good); }
.stop.done .num { fill: #fff; }
.stop.current circle { fill: var(--accent); stroke: var(--accent-text); stroke-width: .5; r: 4.4; }
.stop.current .num { fill: var(--accent-text); }
.stop:focus-visible circle { stroke: var(--accent); stroke-width: 1; }
.spot { fill: var(--bad); stroke: var(--surface); stroke-width: .6; }
.arrow {stroke: var(--bad); stroke-width: 1.4; }
.head { fill: var(--bad); }
.pointer { font-size: 3.6px; font-weight: 700; fill: var(--bad); paint-order: stroke; stroke: var(--surface-2); stroke-width: .9px; }
</style>
