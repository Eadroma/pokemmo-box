import type { Role } from './guides.ts'

// Display text for a guide's team slot; the Role part is what gets checked against the collection.
export interface GuideRole extends Role {
  name: string // short name used in the guide text (route leads)
  title: string
  text: string
  itemName?: string // the game's item names are abbreviated ("Lunet. Choix")
}

// Game nature index order (same as NATURES_EN).
export const NATURES_FR = ['Hardi', 'Solo', 'Brave', 'Rigide', 'Mauvais', 'Assuré', 'Docile', 'Relax', 'Malin', 'Lâche', 'Timide', 'Pressé', 'Sérieux', 'Jovial', 'Naïf', 'Modeste', 'Doux', 'Discret', 'Pudique', 'Foufou', 'Calme', 'Gentil', 'Malpoli', 'Prudent', 'Bizarre']

const MODEST = [15], SPECIAL = { spa: 31, spe: 31 }, PHYSICAL = { atk: 31, spe: 31 }, BULK = { hp: 20, def: 20, spd: 20 }
const SPECS = 5297, SCARF = 5287, BAND = 5220, WIDE_LENS = 5265

export const RUNE_TEAM: GuideRole[] = [
  { id: 'gothitelle', name: 'Sidérella', title: 'Sidérella (Gothitelle)', text: 'En tête. Fouille repère les Miaouss qui portent un objet ; Possessif bloque leurs attaques de statut. N.100 conseillé, PV et Déf en priorité.', species: [576], ability: 119, natures: [5, 9, 8], item: 0, moves: [286, 95, 417, 204] },
  { id: 'weavile', name: 'Dimoret', title: 'Dimoret (Weavile)', text: 'Le voleur : Pickpocket prend l’objet quand un Miaouss le touche. PV et Déf élevés.', species: [461], ability: 124, item: 0 },
  { id: 'scent', name: 'Doux Parfum', title: 'Lanceur de Doux Parfum', text: 'N’importe quel Pokémon qui connaît Doux Parfum, PP au max.', moves: [230] },
]

export const HELLS_TEAM: GuideRole[] = [
  { id: 'typhlosion', name: 'Typhlosion', title: 'Typhlosion', text: 'Attaquant spécial Feu.', species: [157], natures: MODEST, item: SPECS, itemName: 'Lunettes Choix', ability: 66, moves: [284, 510, 270], ivs: SPECIAL },
  { id: 'blastoise', name: 'Tortank', title: 'Tortank (Blastoise)', text: 'Attaquant spécial Eau.', species: [9], natures: MODEST, item: SCARF, itemName: 'Mouchoir Choix', ability: 67, moves: [323, 59, 270], ivs: SPECIAL },
  { id: 'vanilluxe', name: 'Sorbouboul', title: 'Sorbouboul (Vanilluxe)', text: 'Attaquant spécial Glace. Talent libre.', species: [584], natures: MODEST, item: SCARF, itemName: 'Mouchoir Choix', moves: [59, 196], ivs: SPECIAL },
  { id: 'aerodactyl', name: 'Ptéra', title: 'Ptéra (Aerodactyl)', text: 'Attaquant physique. Clairvoyance (capacité œuf) en plus pour Atalanopolis.', species: [142], natures: [3], item: WIDE_LENS, itemName: 'Loupe', moves: [157, 241, 182], ivs: { ...PHYSICAL, ...BULK } },
  { id: 'excadrill', name: 'Minotaupe', title: 'Minotaupe (Excadrill)', text: 'Attaquant physique. Brise Moule est obligatoire.', species: [530], natures: [13], item: BAND, itemName: 'Bandeau Choix', ability: 104, moves: [89, 157, 270], ivs: { ...PHYSICAL, ...BULK } },
  { id: 'meloetta', name: 'Meloetta', title: 'Meloetta', text: 'Soutien et attaquant spécial, avec Psyko ou Ball’Ombre en 4e. Mouchoir Choix en Hoenn et Kanto, puis Lunettes Choix.', species: [648], natures: MODEST, item: SCARF, itemName: 'Mouchoir Choix', moves: [304, 270], ivs: SPECIAL },
]
