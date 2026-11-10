import type { Spawn } from '~/utils/swarms'

// worker/ in this repo: receives Alphapedia webhooks, serves the latest ones.
const EVENTS_URL = 'https://pokemmo-box-events.boukottaya-jr.workers.dev/events'
export const ALPHAPEDIA = 'https://alpha.pokemmotools.org'
const REFRESH_MS = 60_000

// Live alphas/swarms for a page: polls the worker while the page is open. Client-only (starts on mount).
export function useSpawns() {
  const { t } = useI18n()
  const { name } = useLoc()
  const spawns = ref<Spawn[]>([])
  const game = ref<Awaited<ReturnType<typeof loadGame>> | null>(null)
  const loaded = ref(false)
  const loadError = ref(false)
  const now = ref(Date.now())
  async function refresh() {
    try {
      spawns.value = parseSpawns(await $fetch<{ payload: unknown }[]>(EVENTS_URL))
      loadError.value = false
    }
    catch { loadError.value = true }
    loaded.value = true
  }
  let timers: ReturnType<typeof setInterval>[] = []
  onMounted(() => {
    refresh()
    loadGame().then(g => (game.value = g), () => {})
    timers = [setInterval(refresh, REFRESH_MS), setInterval(() => (now.value = Date.now()), 15_000)]
  })
  onUnmounted(() => timers.forEach(clearInterval))

  // Alphapedia sends English names; show ours (current language) when the game data knows them.
  const enMap = <T extends { en: string | null }>(rec: Record<number, T> | T[] = []) =>
    new Map(Object.values(rec).filter(x => x.en).map(x => [x.en!.toLowerCase(), x]))
  const species = computed(() => enMap(game.value?.species))
  const moves = computed(() => enMap(game.value?.moves))
  const abilities = computed(() => enMap(game.value?.abilities))
  const mon = (s: Spawn) => species.value.get(s.pokemon.toLowerCase())
  const fr = (m: Map<string, { name: string, en?: string | null, es?: string | null }>, en: string) => {
    const x = m.get(en.toLowerCase())
    return x ? name(x) : en
  }

  const live = (kind: Spawn['kind']) => spawns.value.filter(s => s.kind === kind && s.endsAt > now.value).sort((a, b) => a.endsAt - b.endsAt)
  const alphas = computed(() => live('alpha'))
  const swarms = computed(() => live('swarm'))
  const ended = computed(() => spawns.value.filter(s => s.endsAt <= now.value).sort((a, b) => b.endsAt - a.endsAt).slice(0, 12))
  const minutes = (ms: number) => Math.max(1, Math.round(Math.abs(ms) / 60_000))
  const left = (s: Spawn) => {
    const m = minutes(s.endsAt - now.value)
    return m >= 60 ? t('swarms.endsInH', { h: Math.floor(m / 60), m: m % 60 }) : t('swarms.endsIn', { m })
  }
  const where = (s: Spawn) => (s.location ? t('swarms.where', { region: s.region, location: s.location }) : s.region)

  return { loaded, loadError, now, alphas, swarms, ended, moves, abilities, mon, fr, minutes, left, where }
}
