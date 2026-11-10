// Hand-drawn schematic maps (our own, not the game's art): towns on a 0–100 grid and the roads between them.
// shortcut: positions are approximate (from memory of each region's layout), good enough to orient, not to navigate.
export interface MapTown { id: string, name: string, x: number, y: number, small?: boolean }
export interface RegionMap { towns: MapTown[], roads: [string, string][], water?: { x: number, y: number, w: number, h: number }[], islands?: { x: number, y: number, rx: number, ry: number }[] }

const town = (id: string, name: string, x: number, y: number, small = false): MapTown => ({ id, name, x, y, small })

export const MAPS: Record<string, RegionMap> = {
  kanto: {
    towns: [town('pallet', 'Bourg Palette', 22, 80, true), town('viridian', 'Jadielle', 22, 58, true), town('pewter', 'Argenta', 22, 24), town('cerulean', 'Azuria', 62, 18, true), town('saffron', 'Safrania', 62, 44), town('celadon', 'Céladopole', 40, 44), town('vermilion', 'Carmin sur Mer', 62, 66), town('lavender', 'Lavanville', 86, 44, true), town('fuchsia', 'Parmanie', 50, 86), town('cinnabar', 'Cramois’Île', 22, 97), town('indigo', 'Plateau Indigo', 6, 22, true)],
    roads: [['pallet', 'viridian'], ['viridian', 'pewter'], ['pewter', 'cerulean'], ['cerulean', 'saffron'], ['saffron', 'vermilion'], ['saffron', 'celadon'], ['saffron', 'lavender'], ['cerulean', 'lavender'], ['celadon', 'fuchsia'], ['lavender', 'fuchsia'], ['vermilion', 'fuchsia'], ['fuchsia', 'cinnabar'], ['cinnabar', 'pallet'], ['viridian', 'indigo']],
    water: [{ x: 0, y: 88, w: 100, h: 16 }],
  },
  hoenn: {
    towns: [town('littleroot', 'Bourg-en-Vol', 22, 80, true), town('petalburg', 'Clémenti-Ville', 10, 66, true), town('rustboro', 'Mérouville', 6, 38), town('dewford', 'Village Myokara', 8, 94), town('slateport', 'Poivressel', 34, 86, true), town('mauville', 'Lavandia', 34, 56), town('lavaridge', 'Vermilava', 24, 34), town('fallarbor', 'Autéquia', 16, 12, true), town('fortree', 'Cimetronelle', 52, 16), town('lilycove', 'Nénucrique', 72, 28, true), town('mossdeep', 'Algatia', 92, 38), town('sootopolis', 'Atalanopolis', 80, 58), town('pacifidlog', 'Pacifiville', 58, 82, true), town('evergrande', 'Éternara', 96, 74, true)],
    roads: [['littleroot', 'petalburg'], ['petalburg', 'rustboro'], ['rustboro', 'fallarbor'], ['littleroot', 'slateport'], ['slateport', 'mauville'], ['mauville', 'lavaridge'], ['lavaridge', 'fallarbor'], ['mauville', 'fortree'], ['fortree', 'lilycove'], ['lilycove', 'mossdeep'], ['mossdeep', 'sootopolis'], ['sootopolis', 'evergrande'], ['slateport', 'pacifidlog'], ['pacifidlog', 'sootopolis'], ['dewford', 'slateport'], ['dewford', 'rustboro']],
    water: [{ x: 40, y: 64, w: 64, h: 40 }, { x: 66, y: 32, w: 38, h: 34 }, { x: -4, y: 86, w: 30, h: 18 }],
  },
  sinnoh: {
    towns: [town('twinleaf', 'Bonaugure', 20, 90, true), town('sandgem', 'Littorella', 28, 82, true), town('jubilife', 'Féli-Cité', 28, 68, true), town('canalave', 'Joliberges', 8, 66, true), town('oreburgh', 'Charbourg', 44, 68), town('floaroma', 'Floraville', 26, 52, true), town('eterna', 'Vestigion', 40, 38), town('hearthome', 'Unionpolis', 56, 62, true), town('solaceon', 'Bonville', 62, 46, true), town('veilstone', 'Voilaroc', 78, 42), town('pastoria', 'Verchamps', 76, 76), town('celestic', 'Célestia', 56, 30, true), town('snowpoint', 'Frimapic', 44, 6, true), town('sunyshore', 'Rivamar', 94, 74), town('league', 'Ligue Pokémon', 94, 46, true)],
    roads: [['twinleaf', 'sandgem'], ['sandgem', 'jubilife'], ['jubilife', 'canalave'], ['jubilife', 'oreburgh'], ['jubilife', 'floaroma'], ['floaroma', 'eterna'], ['eterna', 'celestic'], ['celestic', 'snowpoint'], ['oreburgh', 'hearthome'], ['jubilife', 'hearthome'], ['hearthome', 'solaceon'], ['solaceon', 'veilstone'], ['hearthome', 'pastoria'], ['pastoria', 'veilstone'], ['pastoria', 'sunyshore'], ['sunyshore', 'league'], ['eterna', 'hearthome']],
    water: [{ x: 84, y: 50, w: 20, h: 54 }],
  },
  unova: {
    towns: [town('nuvema', 'Renouet', 88, 90, true), town('accumula', 'Arabelle', 88, 76, true), town('striaton', 'Ogoesse', 76, 62), town('nacrene', 'Maillard', 60, 62, true), town('castelia', 'Volucité', 56, 86), town('nimbasa', 'Méanville', 56, 44), town('driftveil', 'Port Yoneuve', 32, 48), town('mistralton', 'Parsemille', 20, 30), town('icirrus', 'Flocombe', 24, 10), town('opelucid', 'Janusia', 60, 14), town('lacunosa', 'Entrelasque', 80, 18, true), town('undella', 'Vaguelone', 94, 34, true)],
    roads: [['nuvema', 'accumula'], ['accumula', 'striaton'], ['striaton', 'nacrene'], ['nacrene', 'castelia'], ['castelia', 'nimbasa'], ['nimbasa', 'driftveil'], ['driftveil', 'mistralton'], ['mistralton', 'icirrus'], ['icirrus', 'opelucid'], ['opelucid', 'lacunosa'], ['lacunosa', 'undella'], ['undella', 'nimbasa']],
    water: [{ x: 26, y: 70, w: 60, h: 34 }, { x: -4, y: 52, w: 24, h: 52 }],
  },
  johto: {
    towns: [town('newbark', 'Bourg Geon', 92, 62, true), town('cherrygrove', 'Ville Griotte', 78, 64, true), town('violet', 'Mauville', 68, 38), town('azalea', 'Écorcia', 66, 84), town('goldenrod', 'Doublonville', 48, 70), town('ecruteak', 'Rosalia', 46, 34, true), town('olivine', 'Oliville', 26, 46), town('cianwood', 'Irisia', 6, 62), town('mahogany', 'Acajou', 74, 20), town('blackthorn', 'Ébénelle', 90, 16)],
    roads: [['newbark', 'cherrygrove'], ['cherrygrove', 'violet'], ['violet', 'azalea'], ['azalea', 'goldenrod'], ['goldenrod', 'violet'], ['goldenrod', 'ecruteak'], ['ecruteak', 'olivine'], ['olivine', 'cianwood'], ['ecruteak', 'mahogany'], ['mahogany', 'blackthorn'], ['violet', 'ecruteak']],
    water: [{ x: -4, y: 52, w: 34, h: 52 }],
  },
  sevii: {
    towns: [town('mtember', 'Mont Braise', 18, 4, true), town('kindle', 'Chemin Rocheux', 28, 14, true), town('one', 'Île 1', 20, 30), town('treasure', 'Plage Trésor', 18, 46), town('two', 'Île 2', 44, 18, true), town('three', 'Île 3', 42, 48, true), town('four', 'Île 4', 72, 14, true), town('five', 'Île 5', 84, 38, true), town('six', 'Île 6', 62, 72, true), town('seven', 'Île 7', 86, 86, true)],
    roads: [['one', 'kindle'], ['kindle', 'mtember'], ['one', 'treasure'], ['one', 'two'], ['one', 'three'], ['two', 'four'], ['four', 'five'], ['three', 'six'], ['six', 'seven'], ['five', 'seven']],
    water: [{ x: -4, y: -4, w: 108, h: 108 }],
    islands: [{ x: 20, y: 26, rx: 9, ry: 24 }, { x: 44, y: 18, rx: 6, ry: 5 }, { x: 40, y: 48, rx: 8, ry: 7 }, { x: 72, y: 14, rx: 7, ry: 6 }, { x: 84, y: 38, rx: 8, ry: 7 }, { x: 64, y: 74, rx: 9, ry: 8 }, { x: 86, y: 86, rx: 9, ry: 9 }],
  },
}

// Where each 7 Hells gym is on its region's map.
export const GYM_TOWN: Record<string, string> = {
  h1: 'mossdeep', h2: 'lavaridge', h3: 'dewford', h4: 'mauville', h5: 'rustboro', h6: 'fortree', h7: 'sootopolis',
  k1: 'vermilion', k2: 'cinnabar', k3: 'pewter', k4: 'saffron', k5: 'celadon', k6: 'fuchsia',
  s1: 'pastoria', s2: 'veilstone', s3: 'eterna', s4: 'oreburgh', s5: 'sunyshore',
  u1: 'castelia', u2: 'driftveil', u3: 'striaton', u4: 'striaton', u5: 'striaton', u6: 'opelucid', u7: 'icirrus', u8: 'mistralton', u9: 'nimbasa',
  j1: 'goldenrod', j2: 'azalea', j3: 'violet', j4: 'mahogany', j5: 'cianwood', j6: 'olivine', j7: 'blackthorn',
}

export interface MapStop { key: string, town: string, label: string, state: 'current' | 'done' | 'todo' }

// Where the game's place names (encounter data) sit on the schematic maps. Keys are normalised (see norm).
// Routes sit between the towns they link. shortcut: hand-placed and approximate; unknown places get no pin.
type Spot = [number, number] | [string, number, number] // [x, y] on the region's map, or [map, x, y]
const S = (x: number, y: number): Spot => ['sevii', x, y]
const PLACES: Record<string, Record<string, Spot>> = {
  kanto: {
    'route 1': [22, 69], 'route 2': [22, 41], 'route 3': [36, 22], 'route 4': [48, 18], 'route 5': [62, 31], 'route 6': [62, 55], 'route 7': [51, 44], 'route 8': [74, 44], 'route 9': [74, 18], 'route 10': [86, 30], 'route 11': [74, 66], 'route 12': [86, 58], 'route 13': [80, 74], 'route 14': [70, 80], 'route 15': [60, 86], 'route 16': [30, 44], 'route 17': [30, 64], 'route 18': [40, 84], 'chenal 19': [48, 94], 'chenal 20': [36, 97], 'chenal 21': [22, 89], 'route 22': [14, 58], 'route 23': [8, 40], 'route 24': [62, 10], 'route 25': [72, 8],
    'route victoire': [6, 31], 'foret de jade': [22, 34], 'mont selenite': [30, 20], 'caverne azuree': [55, 12], 'centrale': [88, 26], 'tour pokemon': [88, 49], 'manoir pokemon': [26, 94], 'iles ecume': [36, 94], 'cave taupiqueur': [42, 62],
    'ile 1': S(20, 30), 'plage tresor': S(18, 46), 'route tison': S(28, 14), 'mont braise': S(18, 4), 'cap falaise': S(46, 14), 'pont du lien': S(34, 46), 'port ile 3': S(44, 52), 'bois baies': S(42, 42), 'ile 4': S(72, 14), 'grotte de glace': S(74, 9), 'ile 5': S(84, 38), 'pre de l\'ile 5': S(88, 34), 'memorial': S(82, 44), 'grotte perdue': S(88, 42), 'chemin vert': S(60, 70), 'agualcanal': S(70, 64), 'vallee ruine': S(66, 78), 'canyon sesor': S(88, 80), 'entree canyon': S(84, 90), 'ruines tanoby': S(84, 96), 'tour dresseurs': S(92, 78),
  },
  johto: {
    'route 26': [98, 48], 'route 27': [98, 66], 'chutes tohjo': [99, 58], 'route 28': [99, 36], 'mont argente': [99, 28], 'grotte argentee': [99, 26], 'route victoire': [98, 40], 'route 29': [85, 63], 'route 30': [76, 52], 'route 31': [72, 42], 'route 32': [68, 60], 'route 33': [66, 78], 'route 34': [56, 78], 'route 35': [48, 58], 'route 36': [58, 38], 'route 37': [48, 40], 'route 38': [38, 38], 'route 39': [30, 42], 'chenal 40': [16, 50], 'chenal 41': [12, 58], 'route 42': [60, 24], 'route 43': [74, 12], 'route 44': [82, 18], 'route 45': [90, 30], 'route 46': [86, 50], 'route 47': [4, 72], 'route 48': [4, 80],
    'route de glace': [82, 14], 'antre du dragon': [95, 9], 'antre noir': [76, 38], 'bois aux chenes': [58, 82], 'caves jumelles': [66, 72], 'grotte falaise': [6, 68], 'portail falaise': [8, 70], 'lac colere': [74, 6], 'mont creuset': [66, 24], 'parc naturel': [50, 48], 'puits ramoloss': [68, 88], 'repaire rocket': [76, 23], 'ruines d\'alpha': [60, 56], 'tour carillon': [44, 26], 'tour cendree': [42, 32], 'tour chetiflor': [66, 34], 'tourb\'iles': [16, 64],
  },
  hoenn: {
    'route 101': [22, 72], 'route 102': [16, 66], 'route 103': [26, 62], 'route 104': [6, 58], 'bois clementi': [6, 48], 'route 110': [34, 72], 'route 111': [34, 40], 'route 112': [28, 40], 'route 113': [24, 16], 'route 114': [12, 20], 'route 115': [6, 26], 'route 117': [24, 56], 'route 118': [44, 56], 'route 119': [48, 36], 'route 120': [58, 18], 'route 121': [66, 24], 'chenal 122': [70, 36], 'route 123': [60, 44],
    'chenal 105': [4, 72], 'chenal 106': [4, 86], 'chenal 107': [18, 94], 'chenal 108': [24, 94], 'chenal 109': [32, 94], 'chenal 124': [84, 30], 'chenal 125': [98, 32], 'chenal 126': [80, 50], 'chenal 127': [88, 52], 'chenal 128': [90, 64], 'chenal 129': [82, 80], 'chenal 130': [74, 82], 'chenal 131': [66, 82], 'chenal 132': [52, 82], 'chenal 133': [48, 84], 'chenal 134': [44, 86],
    'grotte granite': [6, 90], 'chemin ardent': [28, 30], 'mont memoria': [70, 40], 'pilier celeste': [64, 88], 'grotte origine': [80, 62], 'caverne fondmer': [90, 68], 'grotte atelier': [94, 33], 'site meteore': [10, 26], 'sentier sinuroc': [22, 26], 'tunnel merazon': [16, 38], 'voie du desert': [12, 17], 'planque magma': [20, 22], 'planque aqua': [76, 24], 'new lavandia': [38, 66], 'epave': [26, 96], 'tour mirage': [30, 36], 'zone de combat': [66, 94], 'route victoire': [96, 66],
  },
  sinnoh: {
    'route 201': [24, 86], 'route 202': [28, 75], 'route 203': [36, 68], 'route 204': [26, 60], 'route 205': [32, 44], 'route 206': [44, 50], 'route 207': [48, 64], 'route 208': [52, 66], 'route 209': [60, 54], 'route 210': [60, 38], 'route 211': [48, 36], 'route 212': [64, 70], 'route 213': [84, 80], 'route 214': [78, 58], 'route 215': [70, 42], 'route 216': [46, 22], 'route 217': [44, 14], 'route 218': [16, 66], 'route 219': [28, 94], 'chenal 220': [36, 96], 'route 221': [46, 96], 'route 222': [88, 74], 'chenal 223': [94, 60], 'route 224': [98, 40], 'route 225': [84, 16], 'chenal 226': [94, 10], 'route 227': [82, 8], 'route 228': [74, 8], 'route 229': [90, 24], 'chenal 230': [96, 20],
    'aire de detente': [90, 26], 'entree charbourg': [40, 70], 'mine charbourg': [46, 72], 'foret vestigion': [34, 44], 'forge fuego': [22, 48], 'source adieu': [52, 48], 'grotte retour': [52, 44], 'grotte reveche': [40, 52], 'grotte ruineman.': [80, 54], 'tunnel ruineman.': [80, 54], 'ile de fer': [2, 58], 'jardin trophee': [60, 72], 'lac courage': [78, 66], 'rive lac courage': [82, 64], 'lac savoir': [40, 4], 'rive lac savoir': [44, 10], 'lac verite': [14, 92], 'les eoliennes': [34, 54], 'mont abrupt': [80, 4], 'mont couronne': [50, 46], 'temple frimapic': [48, 4], 'vieux chateau': [32, 40], 'route victoire': [94, 52],
  },
  unova: {
    'route 1': [88, 83], 'route 2': [88, 69], 'route 3': [68, 62], 'route 4': [56, 66], 'route 5': [44, 46], 'route 6': [24, 40], 'route 7': [20, 20], 'route 8': [30, 8], 'route 9': [70, 12], 'route 10': [78, 4], 'route 11': [70, 20], 'route 12': [78, 24], 'route 13': [88, 26], 'route 14': [96, 24], 'route 15': [84, 36], 'route 16': [64, 46], 'chenal 17': [10, 80], 'route 18': [6, 70], 'route victoire': [82, 2],
    'desert delassant': [52, 62], 'chateau enfoui': [48, 58], 'pont du hameau': [74, 22], 'autel abondance': [96, 14], 'baie vaguelone': [98, 40], 'bois des illusions': [70, 44], 'labo p2': [4, 76], 'foret d\'empoigne': [58, 72], 'grotte cyclopeenne': [82, 10], 'grotte electrolithe': [26, 42], 'grotte parsemille': [14, 34], 'hangar frigorifique': [30, 54], 'mont fore': [32, 18], 'tour des cieux': [16, 22], 'tour dragospire': [18, 4], 'tourbiere flocombe': [24, 14], 'vestiges du reve': [78, 56],
  },
}
export const REGION_MAP: Record<string, string> = { Kanto: 'kanto', Johto: 'johto', Hoenn: 'hoenn', Sinnoh: 'sinnoh', Unys: 'unova' }
const norm = (s: string) => s.replace(/ \(.*\)$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, '\'').toLowerCase().trim()

// Map and point for a game place name ("Route 7 (Nord)", "Celadopole"…); only the map when the place is unknown.
export function placeOf(region: string, place: string): { map: string, x?: number, y?: number } | null {
  const map = REGION_MAP[region]
  if (!map) return null
  const key = norm(place)
  const spot = PLACES[map]?.[key]
  if (spot) return spot.length === 3 ? { map: spot[0], x: spot[1], y: spot[2] } : { map, x: spot[0], y: spot[1] }
  const town = MAPS[map]!.towns.find(t => norm(t.name) === key)
  return town ? { map, x: town.x, y: town.y } : { map }
}
