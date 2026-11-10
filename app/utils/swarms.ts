// Alphapedia webhooks (swarms + alphas), as stored by worker/ (see README). Payloads are third-party: read defensively.
export interface Spawn {
  kind: 'swarm' | 'alpha'
  id: number
  pokemon: string // English name, as Alphapedia sends it
  region: string
  location: string
  endsAt: number // ms
  notes: string[]
  by: string
  shareUrl: string | null
  // swarms
  fastest: string | null // "Quick Ball 100%"
  cheapest: string | null
  // alphas (English names)
  ability: string
  moves: string[]
  hms: string[]
  locationNotes: string
}

const TOPICS: Record<string, Spawn['kind']> = { swarmpings: 'swarm', alphapings: 'alpha' }
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const strs = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : [])
const ball = (b: unknown) => {
  const first = (b as { Ball?: { Name?: unknown, Chance?: unknown }[] } | undefined)?.Ball?.[0]
  return first && str(first.Name) ? `${str(first.Name)} Ball ${str(first.Chance)}`.trim() : null
}
// Their terms require linking to each event's shareUrl; only accept links to their site.
const safeShareUrl = (u: unknown) => {
  const s = str(u).replace(/^http:/, 'https:')
  return s.startsWith('https://alpha.pokemmotools.org/') ? s : null
}

export function parseSpawns(events: { payload: unknown }[]): Spawn[] {
  const seen = new Set<number>()
  const out: Spawn[] = []
  for (const { payload } of events) {
    const p = payload as Record<string, unknown> | null
    const kind = TOPICS[str(p?.topic)]
    if (!p || !kind || typeof p.id !== 'number' || seen.has(p.id)) continue
    const o = (p.originalJson ?? {}) as Record<string, unknown>
    const d = (o.data ?? {}) as Record<string, unknown>
    const despawn = Number(o.despawnTimestamp)
    if (!str(p.pokemon) || !Number.isFinite(despawn)) continue
    seen.add(p.id)
    out.push({
      kind,
      id: p.id,
      pokemon: str(p.pokemon),
      region: str(p.region),
      location: str(p.location),
      endsAt: despawn * 1000,
      notes: strs(d.Notes).map(n => n.replace(/[*⚠]/g, '').trim()).filter(Boolean),
      by: str(p.published_by),
      shareUrl: safeShareUrl(o.shareUrl),
      fastest: ball(d.Fastest),
      cheapest: ball(d.Cheapest),
      ability: str(d.Ability),
      moves: strs(d.Moveset),
      hms: strs(d.HMs),
      locationNotes: str(d['Location Notes']),
    })
  }
  return out
}
