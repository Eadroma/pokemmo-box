<script setup lang="ts">
defineProps<{ type: string }>()
const COLORS: Record<string, string> = {
  NORMAL: '#9fa19f', FIRE: '#e62829', WATER: '#2980ef', ELECTRIC: '#d6b400', GRASS: '#3fa129', ICE: '#3dcef3', FIGHTING: '#ff8000',
  POISON: '#9141cb', GROUND: '#915121', FLYING: '#6c91c8', PSYCHIC: '#ef4179', BUG: '#91a119', ROCK: '#afa981', GHOST: '#704170',
  DRAGON: '#5060e1', DARK: '#624d4e', STEEL: '#60a1b8',
}
</script>

<template>
  <span
    class="type"
    :style="{ background: COLORS[type] ?? '#888' }"
  >{{ $t(`types.${type}`) }}</span>
</template>

<style scoped>
.type { display: inline-block; min-width: 58px; text-align: center; padding: 1px 7px; border-radius: 6px; color: #fff; font-size: .72rem; font-weight: 650; line-height: 1.5; letter-spacing: .01em; text-shadow: 0 1px 0 rgb(0 0 0 / 30%); }
</style>
