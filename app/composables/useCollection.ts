import type { Species, Move, Named, Item } from './useGameData'
// Explicit imports (not auto-imports) so test/ can run this file under plain Node.
import { parseSpread, toShowdown } from '../utils/pokemon.ts'
import { readZipEntry } from '../utils/zip.ts'

export interface BoxMon {
  species_id: number
  name: string
  species_name: string
  level: number
  shiny: boolean
  alpha: boolean
  ivs: string
  evs: string
  nature_string_id: number
  nature_name: string
  ability_id: number
  ability_name: string
  held_item_id: number
  held_item_name: string
  moves: { move_id: number, move_name: string }[]
}
// The export's accountPC is always a copy of pc, so it isn't kept.
export interface Collection { party: BoxMon[], pc: BoxMon[], battleBox: BoxMon[], importedAt: number }
export const BOXES = ['party', 'pc', 'battleBox'] as const
export type Box = (typeof BOXES)[number]

export const useCollection = () => usePersisted<Collection | null>('pokemmo:collection', null)

// Untrusted JSON from the game export: read loosely, every field is coerced in clean().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any

// Untrusted file: keep only well-formed entries and only the fields we use (keeps localStorage small).
export function clean(list: unknown): BoxMon[] {
  // The Battle Box comes as { "team name": [mons] }: flatten one level of named groups.
  const arr = (Array.isArray(list) ? list : list && typeof list === 'object' ? Object.values(list) : []).flatMap((x: Raw) => (Array.isArray(x) ? x : [x]))
  return arr.filter((m: Raw) => m && Number.isInteger(m.species_id) && typeof m.ivs === 'string' && typeof m.evs === 'string').map((m: Raw) => ({
    species_id: m.species_id, name: String(m.name ?? m.species_name ?? ''), species_name: String(m.species_name ?? ''),
    level: Number(m.level) || 1, shiny: !!m.shiny, alpha: !!m.alpha, ivs: m.ivs, evs: m.evs,
    nature_string_id: m.nature_string_id, nature_name: String(m.nature_name ?? ''), ability_id: m.ability_id, ability_name: String(m.ability_name ?? ''),
    held_item_id: m.held_item_id ?? 0, held_item_name: String(m.held_item_name ?? '-'),
    moves: Array.isArray(m.moves) ? m.moves.map((x: Raw) => ({ move_id: x.move_id, move_name: String(x.move_name ?? '') })) : [],
  }))
}

// Errors carry i18n keys (errors.*).
export async function parseImport(file: File): Promise<Collection> {
  const text = file.name.toLowerCase().endsWith('.zip')
    ? await readZipEntry(await file.arrayBuffer(), 'data/monsters.json')
    : await file.text()
  if (!text) throw new Error('errors.zipNotFound')
  let raw: Raw
  try {
    raw = JSON.parse(text)
  }
  catch { throw new Error('errors.invalidJson') }
  const c: Collection = { party: clean(raw.party), pc: clean(raw.pc), battleBox: clean(raw.battleBox), importedAt: Date.now() }
  if (!c.party.length && !c.pc.length && !c.battleBox.length) throw new Error('errors.empty')
  return c
}

export const ivTotal = (m: BoxMon) => m.ivs.split('/').reduce((a, b) => a + Number(b), 0)
export const natureIndex = (m: BoxMon) => m.nature_string_id - 180000

export function monToShowdown(m: BoxMon, g: { species: Species[], moves: Record<number, Move>, abilities: Record<number, Named>, items: Record<number, Item> }) {
  const sp = g.species.find(s => s.id === m.species_id)
  const item = m.held_item_id ? g.items[m.held_item_id] : null
  return toShowdown({
    species: sp?.en ?? m.species_name,
    nickname: m.name !== m.species_name ? m.name : undefined,
    item: item ? (item.en ?? item.name) : null,
    ability: g.abilities[m.ability_id]?.en ?? m.ability_name,
    level: m.level, shiny: m.shiny, nature: natureIndex(m),
    ivs: parseSpread(m.ivs), evs: parseSpread(m.evs),
    moves: m.moves.map(x => g.moves[x.move_id]?.en ?? x.move_name),
  })
}
