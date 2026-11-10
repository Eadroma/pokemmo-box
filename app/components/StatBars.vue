<script setup lang="ts">
// values keyed by Stat (hp, atk…); max sets the full bar width.
const props = withDefaults(defineProps<{ values: Record<Stat, number>, max?: number, plus?: Stat, minus?: Stat }>(), { max: 255, plus: undefined, minus: undefined })
const total = computed(() => STATS.reduce((a, k) => a + props.values[k], 0))
</script>

<template>
  <table class="stats">
    <tbody>
      <tr
        v-for="k in STATS"
        :key="k"
      >
        <th :class="{ plus: k === plus, minus: k === minus }">
          {{ $t(`stats.${k}`) }}
        </th>
        <td class="n">
          {{ values[k] }}
        </td>
        <td class="bar">
          <span :style="{ width: Math.min(100, (values[k] / max) * 100) + '%', background: `hsl(${Math.min(120, values[k] / max * 200)} 65% 48%)` }" />
        </td>
      </tr>
      <tr>
        <th>{{ $t('stats.total') }}</th>
        <td class="n">
          {{ total }}
        </td>
        <td />
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.stats th { width: 70px; border: 0; padding: 2px 6px 2px 0; }
.stats td { border: 0; padding: 2px 0; }
.n { width: 42px; text-align: right; padding-right: 8px !important; font-variant-numeric: tabular-nums; }
.bar span { display: block; height: 8px; border-radius: 4px; }
.plus { color: var(--bad); } .minus { color: #4a8fe0; }
.plus::after { content: ' +'; } .minus::after { content: ' −'; }
</style>
