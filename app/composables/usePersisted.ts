import type { Ref } from 'vue'

// localStorage-backed ref, shared by every caller of the same key. Storage can throw in private mode: memory then.
// Deliberately not useState: prerendered pages ship a _payload.json with the build-time state (the initial value),
// which Nuxt applies on load and on each navigation and would overwrite what was read from storage.
const store = new Map<string, Ref<unknown>>()

export function usePersisted<T>(key: string, initial: T): Ref<T> {
  if (import.meta.server) return ref(initial) as Ref<T>
  let state = store.get(key) as Ref<T> | undefined
  if (!state) {
    const s = ref(initial) as Ref<T>
    state = s
    store.set(key, s)
    const read = () => {
      try {
        const raw = localStorage.getItem(key)
        if (raw) s.value = JSON.parse(raw) as T
      }
      catch { /* unreadable or blocked storage: keep the in-memory value */ }
    }
    // During hydration the first render must match the prerendered HTML (built with `initial`): read right after.
    if (useNuxtApp().isHydrating) onNuxtReady(read)
    else read()
    // Detached scope: the ref outlives the component that first asked for it, so must its writer.
    effectScope(true).run(() => watch(s, (v) => {
      try {
        localStorage.setItem(key, JSON.stringify(v))
      }
      catch { /* quota/private mode */ }
    }, { deep: true }))
  }
  return state
}
