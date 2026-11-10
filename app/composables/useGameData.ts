// Node types for readPublic(), which only runs server-side.
/// <reference types="node" />
export interface Species {
  id: number
  name: string
  en: string
  es: string
  types: string[]
  regions: string[]
  horde: number
  stats: Record<string, number>
  abilities: number[]
  eggGroups: string[]
  gender: number
  catchRate: number
  obtainable: boolean
  tiers: string[]
  evs: Record<string, number>
}
export interface SpeciesDetail {
  evolutions: { id: number, type: string, val: number }[]
  moves: { id: number, how: string, lvl: number | null }[]
  heldItems: number[]
  locations: { region: string, place: string, kind: string, min: number, max: number, rarity: string[], season: string, horde: number }[]
}
export interface Move { name: string, en: string, es: string, type: string, cat: string, power: number, acc: number, pp: number, prio: number }
export interface Named { name: string, en: string | null, es?: string | null }
export interface Item extends Named { icon: number, desc?: string }
export interface Cosmetic { id: number, name: string, en: string | null, es: string | null, slot: number, icon: number }

// Smogon Gen 5 set (scripts/build-sets.mjs): numbers are game ids (items, abilities, moves, nature index), strings
// are English names the game doesn't have. A move "237:Fire" is Hidden Power of that type.
export interface SmogonSet { format: string, name: string, item: (number | string)[], ability: (number | string)[], nature: (number | string)[], evs: Partial<Record<string, number>>, ivs?: Partial<Record<string, number>>, moves: (number | string)[][] }

// Static files never change at runtime, so one promise per file is shared by every page.
const cache = new Map<string, Promise<unknown>>()
export const loadData = <T>(name: string): Promise<T> => {
  if (!cache.has(name)) {
    const p = import.meta.server ? readPublic(name) : $fetch<T>(`/data/${name}.json`)
    p.catch(() => cache.delete(name)) // a failed load must not stick: the next call retries
    cache.set(name, p)
  }
  return cache.get(name) as Promise<T>
}
// Server-side $fetch hits the Vue router, not /public. shortcut: reads from the project dir, which holds for
// `nuxt dev` / `nuxt generate` (static site); a deployed SSR server would need Nitro serverAssets instead.
async function readPublic(name: string) {
  const { readFile } = await import('node:fs/promises')
  return JSON.parse(await readFile(`${process.cwd()}/public/data/${name}.json`, 'utf8'))
}
export const loadGame = () => Promise.all([
  loadData<Species[]>('species'),
  loadData<Record<number, Move>>('moves'),
  loadData<Record<number, Named>>('abilities'),
  loadData<Record<number, Item>>('items'),
]).then(([species, moves, abilities, items]) => ({ species, moves, abilities, items }))

export const sprite = (id: number, shiny = false) => `/sprites/battle/${id}-${shiny ? 's' : 'n'}.png`
export const icon = (id: number, shiny = false) => `/sprites/icon/${id}-0${shiny ? '-s' : ''}.png`
export const itemIcon = (icon: number) => `/sprites/item/${icon}.png`
