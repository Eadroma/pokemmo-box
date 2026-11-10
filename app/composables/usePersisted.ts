// localStorage-backed ref (client-only pages). Storage can throw in private mode: fall back to memory.
export function usePersisted<T>(key: string, initial: T) {
  const state = useState<T>(`persist:${key}`, () => {
    if (import.meta.server) return initial
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    }
    catch { return initial }
  })
  if (import.meta.client) {
    watch(state, (v) => {
      try {
        localStorage.setItem(key, JSON.stringify(v))
      }
      catch { /* quota/private mode */ }
    }, { deep: true })
  }
  return state
}
