<script setup lang="ts">
// Mounted by app.vue only when there is something to watch: polls live spawns and notifies new ones once.
const { t } = useI18n()
const { name } = useLoc()
const { list } = useWatch()
const { alphas, swarms, mon, where } = useSpawns()
const seen = usePersisted<number[]>('pokemmo:watch-seen', [])
watch([alphas, swarms], () => {
  if (Notification.permission !== 'granted') return
  for (const s of [...alphas.value, ...swarms.value]) {
    const m = mon(s)
    if (!m || !list.value.includes(m.id) || seen.value.includes(s.id)) continue
    seen.value = [...seen.value, s.id].slice(-200)
    const n = new Notification(t(s.kind === 'alpha' ? 'watch.notif.alpha' : 'watch.notif.swarm', { name: name(m) }), {
      body: where(s), icon: icon(m.id), tag: `spawn-${s.id}`,
    })
    n.onclick = () => {
      window.focus()
      navigateTo('/essaims')
    }
  }
})
</script>

<template>
  <span hidden />
</template>
