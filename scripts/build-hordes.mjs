// Builds public/data/hordes.json (EV training index) from the per-species files written by build-data.mjs:
// one row per species × place × encounter kind × horde size, seasons merged.
import { readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../public/data/', import.meta.url)
const read = f => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
const STAT = { hp: 'hp', attack: 'atk', defense: 'def', sp_attack: 'spa', sp_defense: 'spd', speed: 'spe' }

const rows = new Map()
for (const s of read('species.json')) {
  const ev = Object.fromEntries(Object.entries(s.evs ?? {}).filter(([, v]) => v > 0).map(([k, v]) => [STAT[k], v]))
  if (!Object.keys(ev).length) continue
  for (const l of read(`species/${s.id}.json`).locations) {
    if (!l.horde) continue
    const key = [s.id, l.region, l.place, l.kind, l.horde].join('|')
    const row = rows.get(key) ?? rows.set(key, { id: s.id, region: l.region, place: l.place, kind: l.kind, horde: l.horde, ev, seasons: {} }).get(key)
    row.seasons[l.season] = l.rarity
  }
}
writeFileSync(new URL('hordes.json', dir), JSON.stringify([...rows.values()]))
console.log(`hordes.json: ${rows.size} hordes`)
