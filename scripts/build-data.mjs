// Builds public/data/*.json and public/sprites/* from the PokeMMO client dump
// ("Exporter ressources moddables") + English names from PokeAPI (for Showdown export).
// Usage: npm run data [-- "C:\Program Files\PokeMMO\dump"]
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const DUMP = process.argv[2] || 'C:\\Program Files\\PokeMMO\\dump'
const CACHE = '.cache'
const OUT = 'public'
const ZIP = join(DUMP, 'resources', 'dump.zip')
if (!existsSync(ZIP)) throw new Error(`Introuvable: ${ZIP} — lance "Exporter ressources moddables" dans le jeu`)

// shortcut: relies on bsdtar (Windows 10+/macOS) reading zips; on Linux install bsdtar or swap for unzip.
const raw = join(CACHE, 'dump')
const tar = process.platform === 'win32' ? join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar' // Git Bash's GNU tar can't read zips
// The game writes other exports (e.g. your Pokémon) to the same dump.zip: only replace the cache with a real resource dump.
if (execFileSync(tar, ['-tf', ZIP], { encoding: 'utf8', maxBuffer: 1 << 28 }).includes('info/items.json')) {
  rmSync(raw, { recursive: true, force: true })
  mkdirSync(raw, { recursive: true })
  execFileSync(tar, ['-xf', ZIP, '-C', raw, 'info', 'sprites/battlesprites', 'sprites/monstericons', 'sprites/itemicons'])
}
else if (existsSync(join(raw, 'info'))) console.warn(`${ZIP} n'est pas un export de ressources : réutilise ${raw}`)
else throw new Error(`${ZIP} n'est pas un export de ressources — relance "Exporter ressources moddables" dans le jeu`)
const read = p => JSON.parse(readFileSync(join(raw, p), 'utf8'))

// --- English names (PokeAPI CSV, cached) ---
function parseCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue
    const row = []
    let cur = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (q) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"'
          i++
        }
        else if (c === '"') q = false
        else cur += c
      }
      else if (c === '"') q = true
      else if (c === ',') {
        row.push(cur)
        cur = ''
      }
      else cur += c
    }
    row.push(cur)
    rows.push(row)
  }
  return rows.slice(1)
}
async function pokeapi(name) {
  const file = join(CACHE, 'pokeapi', `${name}.csv`)
  if (!existsSync(file)) {
    mkdirSync(join(CACHE, 'pokeapi'), { recursive: true })
    const res = await fetch(`https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/${name}.csv`)
    if (!res.ok) throw new Error(`PokeAPI ${name}: HTTP ${res.status}`)
    writeFileSync(file, await res.text())
  }
  return parseCsv(readFileSync(file, 'utf8'))
}
const EN = '9', FR = '5', ES = '7'
const byLang = (rows, lang) => new Map(rows.filter(r => r[1] === lang).map(r => [Number(r[0]), r[2]]))
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
// The game exports its data names in the client language only (French here): English/Spanish come from PokeAPI,
// by id when PokeMMO shares it, else by matching the French name.
const names = (rows) => {
  const en = byLang(rows, EN), es = byLang(rows, ES)
  const idByFr = new Map()
  for (const r of rows) if (r[1] === FR && !idByFr.has(norm(r[2]))) idByFr.set(norm(r[2]), Number(r[0]))
  // The game abbreviates long names ("Lunet. Choix"): "lunet." matches any word starting with "lunet".
  const words = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[\s.]+/).filter(Boolean)
  const frRows = rows.filter(r => r[1] === FR).map(r => [words(r[2]), Number(r[0])])
  const fuzzy = (fr) => {
    if (!fr.includes('.')) return undefined
    const w = words(fr)
    return frRows.find(([c]) => c.length === w.length && c.every((x, i) => x.startsWith(w[i])))?.[1]
  }
  const idOf = fr => idByFr.get(norm(fr)) ?? fuzzy(fr)
  return { en, es, idOf, enFr: fr => en.get(idOf(fr)) ?? null, esFr: fr => es.get(idOf(fr)) ?? null }
}
const speciesNames = names(await pokeapi('pokemon_species_names'))
const enSpecies = speciesNames.en
const moveNames = names(await pokeapi('move_names'))
const enMoves = moveNames.en
const abilityNames = names(await pokeapi('ability_names'))
const enAbilities = abilityNames.en
// PokeMMO numbers its newer abilities from 545, unknown to PokeAPI: fall back to the French name.
const enAbilityByFr = { get: fr => abilityNames.enFr(fr) }
// PokeMMO's own French wording, identified from the species that carry them. 573 « Menace de Grèle » looks PokeMMO-only: left as is.
const ABILITY_EN = { 545: 'Competitive', 547: 'Protean', 548: 'Neutralizing Gas', 550: 'Sharpness' }
const ABILITY_ES = { 545: 'Tenacidad', 547: 'Mutatipo', 548: 'Gas Reactivo', 550: 'Cortante' }
const itemNames = names(await pokeapi('item_names'))
const enItemByFr = { get: fr => itemNames.enFr(fr) }
const natureNames = names(await pokeapi('nature_names'))
const placeNames = names(await pokeapi('location_names'))
const regionNames = names(await pokeapi('region_names'))

// --- The game's own strings (Exporter Strings vers XML), keyed by string id: only UI texts and cosmetics are translated there ---
const XML_ENT = { amp: '&', apos: '\'', quot: '"', lt: '<', gt: '>' }
const loadStrings = (lang) => {
  const f = join(DUMP, 'strings', `dump_strings_${lang}.xml`)
  return existsSync(f)
    ? new Map([...readFileSync(f, 'utf8').matchAll(/<string id="(\d+)">([^<]*)<\/string>/g)].map(m => [Number(m[1]), m[2].replace(/&(\w+);/g, (e, k) => XML_ENT[k] ?? e).replace(/\s+/g, ' ').trim()]))
    : new Map()
}
const [enStrings, esStrings] = ['en', 'es'].map(loadStrings)

// --- Game data ---
const monsters = read('info/monsters.json')
const skills = read('info/skills.json')
const items = read('info/items.json')

const moves = {}
for (const s of skills) {
  moves[s.id] = { name: s.name, en: enMoves.get(s.id) ?? s.name, es: moveNames.es.get(s.id) ?? moveNames.esFr(s.name) ?? s.name, type: s.type, cat: s.skill_damage_type, power: s.base_power, acc: s.base_accuracy, pp: s.base_pp, prio: s.priority }
}

const abilities = {}
// ids > 649 are alternate forms / event NPC mons (Elfbot, Pumpking…), never obtainable.
const species = monsters.filter(m => m.id <= 649).map((m) => {
  for (const a of m.abilities) abilities[a.id] ??= { name: a.name, en: enAbilities.get(a.id) ?? ABILITY_EN[a.id] ?? enAbilityByFr.get(a.name) ?? a.name, es: abilityNames.es.get(a.id) ?? ABILITY_ES[a.id] ?? abilityNames.esFr(a.name) ?? a.name }
  return {
    id: m.id,
    name: m.name,
    en: enSpecies.get(m.id) ?? m.name,
    es: speciesNames.es.get(m.id) ?? m.name,
    regions: [...new Set(m.locations.map(l => l.region_name))],
    horde: Math.max(0, ...m.locations.map(l => (l.is_horde_5x ? 5 : l.is_horde_3x ? 3 : 0))),
    types: [...new Set(m.types)], // the game lists mono-types twice (FIRE, FIRE), which would square every multiplier
    stats: m.stats,
    abilities: [...new Set(m.abilities.map(a => a.id))],
    eggGroups: m.egg_groups,
    gender: m.gender_ratio,
    catchRate: m.catch_rate,
    obtainable: m.obtainable,
    tiers: m.tiers,
    evs: Object.fromEntries(Object.entries(m.yields).filter(([k, v]) => k.startsWith('ev_') && v).map(([k, v]) => [k.slice(3), v])),
    evolutions: m.evolutions.map(e => ({ id: e.id, type: e.type, val: e.val })),
    moves: m.moves.map(x => ({ id: x.id, how: x.type, lvl: x.level ?? null })),
    heldItems: m.held_items.map(h => h.id),
    locations: m.locations.map(l => ({
      region: l.region_name, place: l.location_name_full, kind: l.type, min: l.min_level, max: l.max_level,
      rarity: [l.rarity_morning, l.rarity_day, l.rarity_night], season: l.season,
      horde: l.is_horde_5x ? 5 : l.is_horde_3x ? 3 : 0,
    })),
  }
})

const itemsOut = {}
for (const it of items) {
  itemsOut[it.id] = { name: it.name, en: enItemByFr.get(it.name), es: itemNames.esFr(it.name), icon: it.icon_id, ...(/^Baie /.test(it.name) ? { desc: it.desc } : {}) }
}

// Cosmetics: icon_id is a shared slot icon (3001x head … 3011x mount), so the slot is icon_id / 10.
// English names come from the game's own string export, keyed by name_string_id.
const cosmetics = items
  .filter(it => it.icon_id >= 30010 && it.icon_id < 30200 && !it.name.startsWith('STRING_')) // STRING_ = no name shipped yet
  .map(it => ({ id: it.id, name: it.name.replace(/\s+/g, ' '), en: enStrings.get(it.name_string_id) ?? null, es: esStrings.get(it.name_string_id) ?? null, slot: Math.floor(it.icon_id / 10), icon: it.icon_id }))

mkdirSync(join(OUT, 'data'), { recursive: true })
const write = (name, data) => writeFileSync(join(OUT, 'data', `${name}.json`), JSON.stringify(data))
// Heavy fields go in one file per species; the index stays small enough for the Pokédex list.
const DETAIL = ['evolutions', 'moves', 'heldItems', 'locations']
mkdirSync(join(OUT, 'data', 'species'), { recursive: true })
for (const sp of species) writeFileSync(join(OUT, 'data', 'species', `${sp.id}.json`), JSON.stringify(Object.fromEntries(DETAIL.map(k => [k, sp[k]]))))
write('learnsets', Object.fromEntries(species.map(sp => [sp.id, [...new Set(sp.moves.map(x => x.id))]])))
write('species', species.map(sp => Object.fromEntries(Object.entries(sp).filter(([k]) => !DETAIL.includes(k)))))
// Wild held items, reversed: item id -> species that can carry it (for "where to farm this item").
const held = {}
for (const sp of species) for (const id of new Set(sp.heldItems)) (held[id] ??= []).push(sp.id)
write('helditems', held)
write('moves', moves)
write('abilities', abilities)
write('items', itemsOut)
write('cosmetics', cosmetics)

// Natures in game order (nature_string_id = 180000 + index, see utils/pokemon.ts).
const NATURES_FR = ['Hardi', 'Solo', 'Brave', 'Rigide', 'Mauvais', 'Assuré', 'Docile', 'Relax', 'Malin', 'Lâche', 'Timide', 'Pressé', 'Sérieux', 'Jovial', 'Naïf', 'Modeste', 'Doux', 'Discret', 'Pudique', 'Foufou', 'Calme', 'Gentil', 'Malpoli', 'Prudent', 'Bizarre']
write('natures', NATURES_FR.map(fr => ({ name: fr, en: natureNames.enFr(fr) ?? fr, es: natureNames.esFr(fr) ?? fr })))
// Places: every name the site shows (encounter places, regions, hand-drawn map towns, 7 Hells cities) -> [en, es].
const { MAPS } = await import('../app/utils/regionMaps.ts')
const { GYMS } = await import('../app/utils/sevenHells.ts')
const allPlaces = new Set([
  ...species.flatMap(sp => sp.locations.flatMap(l => [l.region, l.place.replace(/ \(.*\)$/, '')])),
  ...Object.values(MAPS).flatMap(m => m.towns.map(t => t.name)),
  ...GYMS.map(g => g.city),
])
// The game's French names that differ from PokeAPI's, and places PokeAPI doesn't have at all.
const PLACE_ALIAS = { 'Village Myokara': 'Myokara', 'Entree Canyon': 'Entrée du Canyon', 'Pre De L\'Ile 5': 'Pré Ile 5', 'Grotte Ruineman.': 'Grotte Ruinem.' }
const PLACE_MANUAL = { 'Repaire Rocket': ['Rocket Hideout', 'Guarida Rocket'], 'Tunnel Ruineman.': ['Ruin Maniac Tunnel', 'Ruin Maniac Tunnel'] }
const places = { ...PLACE_MANUAL }
for (const p of allPlaces) {
  if (PLACE_MANUAL[p]) continue
  const q = PLACE_ALIAS[p] ?? p
  const n = regionNames.idOf(q) !== undefined ? regionNames : placeNames
  const en = n.enFr(q), es = n.esFr(q)
  if (en || es) places[p] = [en ?? p, es ?? en ?? p]
}
write('places', places)
console.log(`places ${Object.keys(places).length}/${allPlaces.size} traduits`)

// --- Sprites: battle front (normal/shiny), box icons, item icons ---
const copyDir = (from, to, rename) => {
  mkdirSync(to, { recursive: true })
  let n = 0
  for (const f of readdirSync(from).sort().reverse()) {
    const target = rename(f)
    if (target && !existsSync(join(to, target))) {
      copyFileSync(join(from, f), join(to, target))
      n++
    }
  }
  return n
}
const sp = join(raw, 'sprites')
// Reverse sort puts "-m" before "-f", so the male sprite wins and female is used only when it's the only one.
const battle = copyDir(join(sp, 'battlesprites'), join(OUT, 'sprites', 'battle'), (f) => {
  const m = f.match(/^(\d+)-front-([ns])(?:-[mf])?\.png$/)
  return m ? `${m[1]}-${m[2]}.png` : null
})
// Gender-split species (521, 592, 593) only ship "<id>-<form>-m.png": drop the gender so the site's plain name exists.
const icons = copyDir(join(sp, 'monstericons'), join(OUT, 'sprites', 'icon'), f => f.replace(/^(\d+-\d+)-[mf]/, '$1'))
const itemIcons = copyDir(join(sp, 'itemicons'), join(OUT, 'sprites', 'item'), f => f)

console.log(`species ${species.length}, moves ${skills.length}, abilities ${Object.keys(abilities).length}`)
console.log(`items ${items.length} (sans nom EN: ${Object.values(itemsOut).filter(i => !i.en).length})`)
console.log(`cosmetics ${cosmetics.length} (sans nom EN: ${cosmetics.filter(c => !c.en).length})`)
console.log(`sprites: battle ${battle}, icon ${icons}, item ${itemIcons}`)
