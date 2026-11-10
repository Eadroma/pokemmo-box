// Pure EV-training logic (no Nuxt imports) so `node --test` can run it.
import { STATS, type Stat } from './pokemon.ts'

export interface Horde { id: number, region: string, place: string, kind: string, horde: number, ev: Partial<Record<Stat, number>>, seasons: Record<string, string[]> }

export const EV_CAP = 252
export const EV_TOTAL = 510
export const BERRY_STEP = 10 // each EV-reducing berry removes 10

// EVs one horde gives in a stat; the Macho Brace doubles every Pokémon's yield.
export const hordeEv = (h: Horde, stat: Stat, brace: boolean) => h.horde * (h.ev[stat] ?? 0) * (brace ? 2 : 1)

// Per stat: what is left to gain, how many hordes that takes, how many berries undo an excess.
export function evPlan(current: Record<Stat, number>, target: Record<Stat, number>, perHorde: Partial<Record<Stat, number>>) {
  return STATS.map((stat) => {
    const goal = Math.min(EV_CAP, Math.max(0, target[stat]))
    const left = Math.max(0, goal - current[stat])
    const excess = Math.max(0, current[stat] - goal)
    const per = perHorde[stat] ?? 0
    return { stat, current: current[stat], goal, left, hordes: left && per ? Math.ceil(left / per) : 0, berries: Math.ceil(excess / BERRY_STEP) }
  })
}
