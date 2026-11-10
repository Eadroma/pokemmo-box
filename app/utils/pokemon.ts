// Pure game logic (no Nuxt imports) so `node --test` can run it directly.

export const TYPES = ['NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL'] as const
export type PokeType = (typeof TYPES)[number]

// Gen 2–5 chart (PokeMMO has no Fairy type). Only non-neutral matchups listed.
const CHART: Partial<Record<PokeType, Partial<Record<PokeType, number>>>> = {
  NORMAL: { ROCK: 0.5, STEEL: 0.5, GHOST: 0 },
  FIRE: { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER: { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC: { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS: { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ICE: { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2 },
  POISON: { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0 },
  GROUND: { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING: { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC: { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG: { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5 },
  ROCK: { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST: { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5, STEEL: 0.5 },
  DRAGON: { DRAGON: 2, STEEL: 0.5 },
  DARK: { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, STEEL: 0.5 },
  STEEL: { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5 },
}

export const effectiveness = (atk: string, defTypes: string[]) =>
  defTypes.reduce((m, d) => m * (CHART[atk as PokeType]?.[d as PokeType] ?? 1), 1)

// Stat order used by the game's "a/b/c/d/e/f" IV/EV strings (same as Showdown).
export const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const
export type Stat = (typeof STATS)[number]
const STAT_SD: Record<Stat, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' }
// Species base stats use the game's key names.
const BASE_KEY: Record<Stat, string> = { hp: 'hp', atk: 'attack', def: 'defense', spa: 'sp_attack', spd: 'sp_defense', spe: 'speed' }
export const GAME_STAT = Object.fromEntries(STATS.map(k => [BASE_KEY[k], k])) as Record<string, Stat>

export const baseStats = (base: Record<string, number>) =>
  Object.fromEntries(STATS.map(k => [k, base[BASE_KEY[k]] ?? 0])) as Record<Stat, number>

export const parseSpread = (s: string): Record<Stat, number> => {
  const n = s.split('/').map(Number)
  return Object.fromEntries(STATS.map((k, i) => [k, n[i] ?? 0])) as Record<Stat, number>
}

// Natures in game index order (nature_string_id - 180000). +stat = floor(i/5), -stat = i%5.
export const NATURES_EN = ['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky']
const NATURE_STATS: Stat[] = ['atk', 'def', 'spe', 'spa', 'spd']
export const natureEffect = (i: number) => {
  const plus = NATURE_STATS[Math.floor(i / 5)]!, minus = NATURE_STATS[i % 5]!
  return plus === minus ? null : { plus, minus }
}

export function calcStats(base: Record<string, number>, ivs: Record<Stat, number>, evs: Record<Stat, number>, level: number, nature: number) {
  const eff = natureEffect(nature)
  return Object.fromEntries(STATS.map((k) => {
    const core = Math.floor(((2 * base[BASE_KEY[k]]! + ivs[k] + Math.floor(evs[k] / 4)) * level) / 100)
    if (k === 'hp') return [k, core + level + 10]
    const mult = eff?.plus === k ? 1.1 : eff?.minus === k ? 0.9 : 1
    return [k, Math.floor((core + 5) * mult)]
  })) as Record<Stat, number>
}

export interface ShowdownMon {
  species: string
  nickname?: string
  item?: string | null
  ability?: string
  level: number
  shiny?: boolean
  nature: number
  ivs: Record<Stat, number>
  evs: Record<Stat, number>
  moves: string[]
}

export function toShowdown(m: ShowdownMon) {
  const head = m.nickname && m.nickname !== m.species ? `${m.nickname} (${m.species})` : m.species
  const evs = STATS.filter(k => m.evs[k]).map(k => `${m.evs[k]} ${STAT_SD[k]}`)
  const ivs = STATS.filter(k => m.ivs[k] !== 31).map(k => `${m.ivs[k]} ${STAT_SD[k]}`)
  return [
    head + (m.item ? ` @ ${m.item}` : ''),
    m.ability && `Ability: ${m.ability}`,
    m.level !== 100 && `Level: ${m.level}`,
    m.shiny && 'Shiny: Yes',
    evs.length && `EVs: ${evs.join(' / ')}`,
    `${NATURES_EN[m.nature]} Nature`,
    ivs.length && `IVs: ${ivs.join(' / ')}`,
    ...m.moves.map(x => `- ${x}`),
  ].filter(Boolean).join('\n')
}

// Gen 3–5 Hidden Power type from IV parity (order HP, Atk, Def, Spe, SpA, SpD).
export const HIDDEN_POWER = 237
const HP_TYPES: PokeType[] = ['FIGHTING', 'FLYING', 'POISON', 'GROUND', 'ROCK', 'BUG', 'GHOST', 'STEEL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC', 'ICE', 'DRAGON', 'DARK']
export const hiddenPowerType = (iv: Record<Stat, number>): PokeType => {
  const bits = (['hp', 'atk', 'def', 'spe', 'spa', 'spd'] as const).reduce((sum, k, i) => sum + (iv[k] % 2) * 2 ** i, 0)
  return HP_TYPES[Math.floor((bits * 15) / 63)]!
}
