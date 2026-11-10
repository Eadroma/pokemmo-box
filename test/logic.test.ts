import { test } from 'node:test'
import assert from 'node:assert/strict'
import { effectiveness, calcStats, parseSpread, toShowdown, natureEffect, hiddenPowerType } from '../app/utils/pokemon.ts'
import { clean, monToShowdown } from '../app/composables/useCollection.ts'
import { breedSummary, breedTree, coverTree, canBreed } from '../app/utils/breeding.ts'
import { shinyRate, chanceSeen, encountersFor } from '../app/utils/shiny.ts'
import { encodeTeam, decodeTeam } from '../app/utils/share.ts'
import { auditMon } from '../app/utils/audit.ts'
import { pushEvent } from '../worker/src/events.ts'
import { parseSpawns } from '../app/utils/swarms.ts'
import { bestFor } from '../app/utils/guides.ts'
import { evPlan, hordeEv } from '../app/utils/evs.ts'
import { placeOf } from '../app/utils/regionMaps.ts'

test('type chart', () => {
  assert.equal(effectiveness('ICE', ['DRAGON', 'GROUND']), 4) // Carchacrok
  assert.equal(effectiveness('ELECTRIC', ['GROUND']), 0)
  assert.equal(effectiveness('GHOST', ['STEEL']), 0.5) // gen 5 rule
})

test('natures', () => {
  assert.deepEqual(natureEffect(11), { plus: 'spe', minus: 'def' }) // Pressé / Hasty
  assert.equal(natureEffect(12), null) // Sérieux
})

test('stats: Garchomp lv100 Jolly 252 Atk/252 Spe', () => {
  const base = { hp: 108, attack: 130, defense: 95, speed: 102, sp_attack: 80, sp_defense: 85 }
  const s = calcStats(base, parseSpread('31/31/31/31/31/31'), parseSpread('4/252/0/0/0/252'), 100, 13)
  assert.deepEqual(s, { hp: 358, atk: 359, def: 226, spa: 176, spd: 206, spe: 333 })
})

test('showdown export', () => {
  const txt = toShowdown({ species: 'Garchomp', item: 'Choice Scarf', ability: 'Rough Skin', level: 50, nature: 13,
    ivs: parseSpread('31/31/31/0/31/31'), evs: parseSpread('4/252/0/0/0/252'), moves: ['Earthquake'] })
  assert.equal(txt, 'Garchomp @ Choice Scarf\nAbility: Rough Skin\nLevel: 50\nEVs: 4 HP / 252 Atk / 252 Spe\nJolly Nature\nIVs: 0 SpA\n- Earthquake')
})

test('breeding counts', () => {
  assert.equal(breedSummary(['hp', 'atk']).parents, 2)
  assert.equal(breedSummary(['hp', 'atk', 'def', 'spa', 'spe']).parents, 16)
  const n = breedSummary(['hp', 'atk', 'def', 'spa', 'spe', 'nature'])
  assert.equal(n.parents, 32)
  assert.equal(n.breeds, 31)
  assert.equal(n.leaves.nature, 1)
  assert.equal(n.braces + n.everstones, 62)
  // nature never appears in a left (non-item) branch except as the item-passed attribute
  const check = (t: ReturnType<typeof breedTree>): void => {
    if (!t.left) return
    assert.ok(!t.left.attrs.includes('nature') || t.left.attrs.at(-1) === 'nature')
    check(t.left)
    check(t.right!)
  }
  check(breedTree(['hp', 'atk', 'def', 'nature']))
})

test('zip reader extracts data/monsters.json from a real dump', async (t: import('node:test').TestContext) => {
  const { readFileSync, existsSync } = await import('node:fs')
  const { readZipEntry } = await import('../app/utils/zip.ts')
  const path = 'C:/Program Files/PokeMMO/dump/resources/dump.zip'
  if (!existsSync(path)) return t.skip('no local dump')
  const b = readFileSync(path)
  const txt = await readZipEntry(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), 'data/monsters.json')
  assert.ok(Array.isArray(JSON.parse(txt!).party))
})

test('hidden power type', () => {
  assert.equal(hiddenPowerType(parseSpread('31/31/31/31/31/31')), 'DARK')
  assert.equal(hiddenPowerType(parseSpread('31/30/30/31/31/31')), 'ICE')
  assert.equal(hiddenPowerType(parseSpread('31/30/31/30/31/30')), 'FIRE')
})

test('import cleaning + showdown from box', () => {
  const [m, ...rest] = clean([
    { species_id: 445, name: 'Chomp', species_name: 'Carchacrok', level: 50, ivs: '31/31/31/31/31/31', evs: '0/252/0/0/4/252',
      nature_string_id: 180013, ability_id: 24, held_item_id: 0, moves: [{ move_id: 89, move_name: 'Séisme' }], ot: 'secret' },
    { species_id: 'x', ivs: '31' }, null,
  ])
  assert.equal(rest.length, 0)
  assert.ok(!('ot' in m!))
  const g = { species: [{ id: 445, en: 'Garchomp' }], moves: { 89: { en: 'Earthquake' } }, abilities: { 24: { en: 'Rough Skin' } }, items: {} }
  assert.equal(monToShowdown(m!, g as never), 'Chomp (Garchomp)\nAbility: Rough Skin\nLevel: 50\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Earthquake')
})

test('webhook events: newest first, capped', () => {
  const ev = (n: number) => ({ receivedAt: n, payload: n })
  let list = pushEvent([], ev(1), 3)
  for (const n of [2, 3, 4]) list = pushEvent(list, ev(n), 3)
  assert.deepEqual(list.map(e => e.receivedAt), [4, 3, 2])
})

test('spawn parsing from Alphapedia webhooks', () => {
  const swarm = { topic: 'swarmpings', id: 7, pokemon: 'Cubone', region: 'Johto', location: 'Mt. Pyre', published_by: 'Owenizer',
    originalJson: { despawnTimestamp: 1794251165, shareUrl: 'http://alpha.pokemmotools.org/swarm-list?pokemon=Cubone',
      data: { Fastest: { Ball: [{ Name: 'Quick', Chance: '100%' }] }, Notes: ['**⚠ Has Thrash ⚠**'] } } }
  const [s, ...rest] = parseSpawns([
    { payload: swarm }, { payload: swarm }, // duplicate delivery
    { payload: { eventType: 'webhook_test' } }, { payload: null },
    { payload: { ...swarm, id: 8, originalJson: { ...swarm.originalJson, shareUrl: 'javascript:alert(1)' } } },
  ])
  assert.equal(s!.endsAt, 1794251165000)
  assert.equal(s!.fastest, 'Quick Ball 100%')
  assert.deepEqual(s!.notes, ['Has Thrash'])
  assert.equal(s!.shareUrl, 'https://alpha.pokemmotools.org/swarm-list?pokemon=Cubone')
  assert.equal(rest.length, 1)
  assert.equal(rest[0]!.shareUrl, null)
  const [a] = parseSpawns([{ payload: { topic: 'alphapings', id: 9, pokemon: 'Salamence', region: 'Hoenn', location: 'Sky Pillar',
    originalJson: { despawnTimestamp: 1794268475, data: { 'Ability': 'Moxie', 'Moveset': ['Dragon Claw', 'Roost'], 'HMs': ['Surf'], 'Location Notes': 'Mach Bike required' } } } }])
  assert.equal(a!.kind, 'alpha')
  assert.deepEqual([a!.ability, a!.moves, a!.hms, a!.locationNotes], ['Moxie', ['Dragon Claw', 'Roost'], ['Surf'], 'Mach Bike required'])
})

test('guide roles: best owned candidate and its missing requirements', () => {
  const role = { id: 'x', species: [530], ability: 104, natures: [13], item: 5220, moves: [89, 157], ivs: { spe: 31, def: 20 } }
  const mon = (o: object) => ({ species_id: 530, ivs: '31/31/31/31/31/31', nature_string_id: 180013, ability_id: 104, held_item_id: 6220, moves: [{ move_id: 89 }, { move_id: 157 }], ...o })
  const perfect = mon({}), wrongAbility = mon({ ability_id: 1, ivs: '31/31/31/31/31/31' }), slow = mon({ ivs: '31/31/10/31/31/0' })
  const best = bestFor(role, [wrongAbility, slow, perfect, mon({ species_id: 1 })])!
  assert.equal(best.mon, perfect) // 6220 counts as the same item as 5220
  assert.ok(best.checks.every(c => c.ok))
  assert.equal(best.others, 2) // other species are not candidates
  const s = bestFor(role, [slow])!
  assert.deepEqual(s.checks.filter(c => !c.ok).map(c => c.kind === 'iv' && c.stat), ['spe', 'def'])
  assert.equal(bestFor({ id: 'y', item: 0 }, [mon({ held_item_id: 0 })])!.checks[0]!.ok, true) // "holds nothing"
  assert.equal(bestFor(role, []), null)
})

test('guide roles: "any species" role only counts mons that meet something', () => {
  const m = (moves: number[]) => ({ species_id: 1, ivs: '0/0/0/0/0/0', nature_string_id: 180000, ability_id: 0, held_item_id: 0, moves: moves.map(move_id => ({ move_id })) })
  const best = bestFor({ id: 'scent', moves: [230] }, [m([1]), m([230]), m([2])])!
  assert.equal(best.others, 0)
  assert.equal(bestFor({ id: 'scent', moves: [230] }, [m([1])]), null)
})

test('EV plan: hordes left, Macho Brace, berries for an excess', () => {
  const h = { id: 17, region: 'Kanto', place: 'x', kind: 'Herbe', horde: 5, ev: { spe: 2 }, seasons: {} }
  assert.equal(hordeEv(h, 'spe', true), 20)
  assert.equal(hordeEv(h, 'atk', true), 0)
  const z = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  const plan = evPlan({ ...z, spe: 12, def: 25 }, { ...z, spe: 252, hp: 4 }, { spe: 20 })
  const by = Object.fromEntries(plan.map(p => [p.stat, p]))
  assert.deepEqual([by.spe!.left, by.spe!.hordes], [240, 12])
  assert.deepEqual([by.hp!.left, by.hp!.hordes], [4, 0]) // no horde chosen for HP: nothing to count
  assert.equal(by.def!.berries, 3) // 25 too many: 3 berries
  assert.equal(evPlan(z, { ...z, atk: 300 }, {})[1]!.goal, 252) // capped
})

test('map places: routes, towns, Sevii and unknown places', () => {
  assert.deepEqual(placeOf('Kanto', 'Route 7 (Nord)'), { map: 'kanto', x: 51, y: 44 })
  assert.deepEqual(placeOf('Kanto', 'Celadopole'), { map: 'kanto', x: 40, y: 44 }) // matched to the town, accents ignored
  assert.equal(placeOf('Kanto', 'Plage Tresor')!.map, 'sevii')
  assert.deepEqual(placeOf('Unys', 'Nowhere'), { map: 'unova' })
  assert.equal(placeOf('Kalos', 'Route 1'), null)
})

test('breeding from the box: a 2x31 parent replaces a whole sub-tree', () => {
  const tree = breedTree(['hp', 'atk', 'spe'])
  // hp+atk already on one mon: only the right branch (hp·spe → hp, spe) is left to find.
  const pool = [{ iv: ['hp', 'atk'] }]
  const { cover, missing } = coverTree(tree, pool, (m, a) => m.iv.includes(a))
  assert.equal(cover.get(tree.left!), pool[0])
  assert.equal(missing, 2)
  assert.equal(canBreed(['monstre'], ['métamorph']), true)
  assert.equal(canBreed(['monstre'], ['eau a']), false)
  assert.equal(canBreed(['ne peuvent pas se reproduire'], ['métamorph']), false)
})

test('shiny odds', () => {
  assert.equal(shinyRate(false, false), 30000)
  assert.equal(shinyRate(true, true), 24000)
  assert.equal(shinyRate(true, false, true), 25500)
  assert.ok(Math.abs(chanceSeen(encountersFor(0.5, 30000), 30000) - 0.5) < 0.001)
})

test('team share link round-trip, and junk links are rejected', async () => {
  const mon = clean([{ species_id: 445, name: 'Carchacrok', ivs: '31/31/31/31/31/31', evs: '0/252/0/0/4/252', level: 50, moves: [{ move_id: 89 }] }])
  const code = await encodeTeam('Rain', mon)
  assert.match(code, /^[\w-]+$/)
  assert.deepEqual(await decodeTeam(code), { name: 'Rain', members: mon })
  assert.equal(await decodeTeam('not-a-team'), null)
})

test('box audit tags', () => {
  const base = { species_id: 1, nature_string_id: 180013, ability_id: 0, held_item_id: 0, moves: [], shiny: false, alpha: false }
  assert.deepEqual(auditMon({ ...base, ivs: '10/2/3/4/5/6' }, []), [{ kind: 'release' }])
  assert.deepEqual(auditMon({ ...base, ivs: '31/31/3/4/5/6' }, [], [{ name: 'Scarf', format: 'ou', nature: [13] }]), [{ kind: 'parent', n: 2 }, { kind: 'smogon', set: 'OU Scarf' }])
  assert.deepEqual(auditMon({ ...base, ivs: '1/2/3/4/5/6', shiny: true }, []), [])
})

test('import: Battle Box grouped by team name, account PC copy flagged', () => {
  const mon = { species_id: 1, ivs: '1/2/3/4/5/6', evs: '0/0/0/0/0/0' }
  assert.equal(clean({ 'Arena rematch': [mon, mon] }).length, 2)
})

test('every guide sentence has an English and a Spanish translation', async () => {
  const { REGIONS, GYMS, PREP, URGENT } = await import('../app/utils/sevenHells.ts')
  const { RUNE_TEAM, HELLS_TEAM } = await import('../app/utils/guideRoles.ts')
  const { readFileSync } = await import('node:fs')
  const fr = new Set<string>()
  const add = (s?: string) => s && fr.add(s)
  REGIONS.forEach(r => add(r.checkpoint))
  for (const g of GYMS) {
    [...g.leads, ...g.base, ...g.notes, g.warn].forEach(add)
    for (const c of g.cases) [c.when, ...c.steps].forEach(add)
  }
  for (const p of PREP) [p.title, ...p.items].forEach(add)
  for (const u of URGENT) [u.problem, u.who, u.fix].forEach(add)
  for (const r of [...RUNE_TEAM, ...HELLS_TEAM]) [r.name, r.title, r.text, r.itemName].forEach(add)
  const rune = readFileSync('app/pages/guides/piece-rune.vue', 'utf8')
  for (const m of rune.slice(0, rune.indexOf('</script>')).matchAll(/^ {2}'(.+)',$/gm)) add(m[1])
  for (const lang of ['en', 'es']) {
    const map = JSON.parse(readFileSync(`i18n/guides/${lang}.json`, 'utf8'))
    assert.deepEqual([...fr].filter(s => !map[s]), [], `missing ${lang} translations`)
  }
})
