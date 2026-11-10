// Recommended sets (EVs, nature, item, moves) from Smogon's Gen 5 analyses, via the pkmn/smogon data export.
// PokeMMO is Gen 5 based: closest Smogon generation. Writes public/data/sets.json keyed by species id.
// Names become game ids when they match (so the site can show them in any language); unknown ones stay English.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const SRC = 'https://pkmn.github.io/smogon/data/sets/gen5.json'
const CACHE = '.cache/smogon-gen5.json'
if (!existsSync(CACHE) || process.argv.includes('--refresh')) {
  const res = await fetch(SRC)
  if (!res.ok) throw new Error(`Smogon sets: HTTP ${res.status}`)
  mkdirSync('.cache', { recursive: true })
  writeFileSync(CACHE, await res.text())
}
const raw = JSON.parse(readFileSync(CACHE, 'utf8'))
const read = name => JSON.parse(readFileSync(`public/data/${name}.json`, 'utf8'))
const key = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const index = rec => new Map(Object.entries(rec).filter(([, v]) => v.en).map(([id, v]) => [key(v.en), Number(id)]))
const species = new Map(read('species').map(s => [key(s.en), s.id]))
const moves = index(read('moves'))
const abilities = index(read('abilities'))
// Several game items share an English name (5xxx/6xxx variants): keep the lowest id.
const items = new Map()
for (const [id, v] of Object.entries(read('items')).sort((a, b) => a[0] - b[0])) if (v.en && !items.has(key(v.en))) items.set(key(v.en), Number(id))
const natures = new Map(read('natures').map((n, i) => [key(n.en), i]))

const list = v => (v === undefined ? [] : Array.isArray(v) ? v : [v])
const ids = (v, map) => list(v).map(x => map.get(key(x)) ?? x)
// Hidden Power types are part of the move name on Smogon; the game has one "Hidden Power" move.
const moveId = x => moves.get(key(x)) ?? (x.startsWith('Hidden Power') ? `${moves.get('hiddenpower') ?? 'HP'}:${x.slice(13)}` : x)

const out = {}
let n = 0
for (const [name, formats] of Object.entries(raw)) {
  const id = species.get(key(name))
  if (!id) continue
  for (const [format, sets] of Object.entries(formats)) {
    if (/vgc|doubles|battlespot|1v1|monotype/.test(format)) continue // singles only, like PokeMMO's PvP tiers
    for (const [setName, s] of Object.entries(sets)) {
      (out[id] ??= []).push({
        format, name: setName,
        item: ids(s.item, items), ability: ids(s.ability, abilities), nature: ids(s.nature, natures),
        evs: list(s.evs)[0] ?? {}, ivs: list(s.ivs)[0],
        moves: list(s.moves).map(slot => list(slot).map(moveId)),
      })
      n++
    }
  }
}
// Main singles tiers first, Dream World and small tiers last.
const ORDER = ['ubers', 'ou', 'uu', 'ru', 'nu', 'pu', 'zu', 'lc']
const rank = f => (ORDER.includes(f) ? ORDER.indexOf(f) : ORDER.length)
for (const list of Object.values(out)) list.sort((a, b) => rank(a.format) - rank(b.format))
writeFileSync('public/data/sets.json', JSON.stringify(out))
console.log(`sets.json: ${n} sets, ${Object.keys(out).length} espèces`)
