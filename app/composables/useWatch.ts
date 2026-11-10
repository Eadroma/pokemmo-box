// Watched species (ids) for alpha/swarm notifications. Notifications only fire while a tab of the site is open
// (SpawnWatcher polls the worker); real push with the tab closed would need a service worker + VAPID keys.
export function useWatch() {
  const list = usePersisted<number[]>('pokemmo:watch', [])
  const enabled = usePersisted<boolean>('pokemmo:watch-on', false)
  const permission = ref<NotificationPermission | 'unsupported'>('default')
  onMounted(() => (permission.value = 'Notification' in window ? Notification.permission : 'unsupported'))
  const toggle = (id: number) => (list.value = list.value.includes(id) ? list.value.filter(x => x !== id) : [...list.value, id])
  async function enable() {
    if (!('Notification' in window)) return
    permission.value = await Notification.requestPermission()
    enabled.value = permission.value === 'granted'
  }
  return { list, enabled, permission, toggle, enable }
}
