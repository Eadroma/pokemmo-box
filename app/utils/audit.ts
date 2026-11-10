// "What to do with this mon": a quick verdict for each Pokémon of the collection. Pure, testable.
import type { MonLike, Role } from './guides.ts'
import { checkMon } from './guides.ts'

export type AuditTag
  = | { kind: 'ready', role: string } // fits a guide's team slot (held item aside: you can hand it one)
    | { kind: 'parent', n: number } // 2+ perfect IVs: worth keeping for breeding
    | { kind: 'smogon', set: string } // its nature matches a Smogon set of its species
    | { kind: 'release' } // nothing above, not shiny, not alpha

export interface AuditMon extends MonLike { shiny: boolean, alpha: boolean }
interface SetLike { name: string, format: string, nature: (number | string)[] }

export function auditMon(m: AuditMon, roles: (Role & { title: string })[], sets: SetLike[] = []): AuditTag[] {
  const tags: AuditTag[] = []
  for (const r of roles) {
    if (!r.species?.includes(m.species_id)) continue
    if (checkMon(r, m).every(c => c.ok || c.kind === 'item')) tags.push({ kind: 'ready', role: r.title })
  }
  const perfect = m.ivs.split('/').filter(v => v === '31').length
  if (perfect >= 2) tags.push({ kind: 'parent', n: perfect })
  const set = sets.find(s => s.nature.includes(m.nature_string_id - 180000))
  if (set) tags.push({ kind: 'smogon', set: `${set.format.toUpperCase()} ${set.name}` })
  if (!tags.length && !m.shiny && !m.alpha) tags.push({ kind: 'release' })
  return tags
}
