// Pure guide logic (no Nuxt imports) so `node --test` can run it.
import type { Stat } from './pokemon.ts'

// What a guide asks of one team slot. Ids are the game's (moves.json, abilities.json, items.json).
export interface Role {
  id: string
  species?: number[] // accepted species; none = any species (e.g. "a Sweet Scent user")
  ability?: number
  natures?: number[] // game nature index (NATURES_EN order)
  item?: number // 0 = must hold nothing
  moves?: number[] // all required
  ivs?: Partial<Record<Stat, number>> // minimum IVs
}

export type Check
  = | { kind: 'ability', id: number, ok: boolean }
    | { kind: 'nature', ids: number[], ok: boolean }
    | { kind: 'item', id: number, ok: boolean }
    | { kind: 'move', id: number, ok: boolean }
    | { kind: 'iv', stat: Stat, min: number, ok: boolean }

// The subset of BoxMon this needs (keeps the file free of composable imports).
export interface MonLike {
  species_id: number
  ivs: string
  nature_string_id: number
  ability_id: number
  held_item_id: number
  moves: { move_id: number }[]
}

const STAT_ORDER: Stat[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
// The game has two ids per item (5xxx and 6xxx) for the same object.
const sameItem = (a: number, b: number) => (a === 0 || b === 0 ? a === b : a % 1000 === b % 1000)

export function checkMon(role: Role, m: MonLike): Check[] {
  const ivs = m.ivs.split('/').map(Number)
  const known = new Set(m.moves.map(x => x.move_id))
  const out: Check[] = []
  if (role.ability !== undefined) out.push({ kind: 'ability', id: role.ability, ok: m.ability_id === role.ability })
  if (role.natures) out.push({ kind: 'nature', ids: role.natures, ok: role.natures.includes(m.nature_string_id - 180000) })
  if (role.item !== undefined) out.push({ kind: 'item', id: role.item, ok: sameItem(m.held_item_id, role.item) })
  for (const id of role.moves ?? []) out.push({ kind: 'move', id, ok: known.has(id) })
  for (const [stat, min] of Object.entries(role.ivs ?? {}) as [Stat, number][])
    out.push({ kind: 'iv', stat, min, ok: (ivs[STAT_ORDER.indexOf(stat)] ?? 0) >= min })
  return out
}

// Best owned candidate for a role: most requirements met, then highest IV total.
export function bestFor<M extends MonLike>(role: Role, mons: M[]) {
  const total = (m: MonLike) => m.ivs.split('/').reduce((a, b) => a + Number(b), 0)
  const ranked = mons
    .filter(m => !role.species || role.species.includes(m.species_id))
    .map(mon => ({ mon, checks: checkMon(role, mon) }))
    .map(c => ({ ...c, score: c.checks.filter(x => x.ok).length }))
    .filter(c => role.species || c.score > 0) // "any species" roles: only mons that meet something
    .sort((a, b) => b.score - a.score || total(b.mon) - total(a.mon))
  return ranked[0] ? { ...ranked[0], others: ranked.length - 1 } : null
}
