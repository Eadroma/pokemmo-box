// PokeMMO shiny odds: base 1/30000; Donator status and your own Shiny Charm each cut it by 10%
// (a link partner's charm without yours: 5%). Sources: PokeMMO wiki "Shiny Pokémon", pikammo.fr.
export const SHINY_BASE = 30000
export const shinyRate = (donator: boolean, charm: boolean, linkCharm = false) =>
  Math.round(SHINY_BASE * (1 - (donator ? 0.1 : 0) - (charm ? 0.1 : linkCharm ? 0.05 : 0)))
// Chance to have seen at least one shiny after `n` encounters.
export const chanceSeen = (n: number, rate: number) => 1 - (1 - 1 / rate) ** n
// Encounters needed for a given cumulative chance (e.g. 0.5 → the "median" hunt).
export const encountersFor = (p: number, rate: number) => Math.ceil(Math.log(1 - p) / Math.log(1 - 1 / rate))
