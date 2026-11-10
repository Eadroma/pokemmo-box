// Game names in the current language. Data files hold the French name plus `en`/`es` (scripts/build-data.mjs);
// a missing translation falls back to English, then French.
interface Localized { name: string, en?: string | null, es?: string | null }

// Words of the encounter-place suffixes ("Zone Nord", "Ss1", "2em"…), translated word by word.
const PARTS: Record<string, Record<string, string>> = {
  en: { Zone: 'Area', Sone: 'Area', Nord: 'North', Sud: 'South', Est: 'East', Ouest: 'West', Centrale: 'Central', Centre: 'Center', Intérieur: 'Inside', Extérieur: 'Outside', Entrée: 'Entrance', Porte: 'Gate', Toit: 'Roof', Tour: 'Tower', Versant: 'Slope', Grotte: 'Cave', Forêt: 'Forest', Profondeurs: 'Depths', Salle: 'Room', Arrière: 'Back', Pièce: 'Room', Cachée: 'Hidden', Chambre: 'Room', Froide: 'Cold', Partie: 'Part', Sup: 'Upper', Inf: 'Lower', Inférieur: 'Lower', Supérieur: 'Upper', Somment: 'Summit', Chenal: 'Route', Montagne: 'Mountain', Manger: 'Dining', Feu: 'Fire', Plante: 'Grass', Eau: 'Water', à: '', de: '', la: '' },
  es: { Zone: 'Zona', Sone: 'Zona', Nord: 'Norte', Sud: 'Sur', Est: 'Este', Ouest: 'Oeste', Centrale: 'Central', Centre: 'Centro', Intérieur: 'Interior', Extérieur: 'Exterior', Entrée: 'Entrada', Porte: 'Puerta', Toit: 'Tejado', Tour: 'Torre', Versant: 'Ladera', Grotte: 'Cueva', Forêt: 'Bosque', Profondeurs: 'Profundidades', Salle: 'Sala', Arrière: 'Trasera', Pièce: 'Sala', Cachée: 'Oculta', Chambre: 'Cámara', Froide: 'Fría', Partie: 'Parte', Sup: 'Superior', Inf: 'Inferior', Inférieur: 'Inferior', Supérieur: 'Superior', Somment: 'Cima', Chenal: 'Ruta', Montagne: 'Montaña', Manger: 'Comedor', Feu: 'Fuego', Plante: 'Planta', Eau: 'Agua', à: '', de: '', la: '' },
}
// Floors: RDC = ground floor (1F), "1er" = 1F above ground (2F), "Ss2" = 2nd basement (B2F).
const floor = (w: string) => w === 'RDC' ? '1F' : /^\d+(er|em)$/.test(w) ? `${Number.parseInt(w) + 1}F` : /^Ss\d+$/.test(w) ? `B${w.slice(2)}F` : null
const places = shallowRef<Record<string, [string, string]>>({})
const natures = shallowRef<Localized[]>([])
let started = false

export function useLoc() {
  const { locale, t } = useI18n()
  if (!started && import.meta.client) {
    started = true
    loadData<Record<string, [string, string]>>('places').then(p => (places.value = p), () => (started = false))
    loadData<Localized[]>('natures').then(n => (natures.value = n), () => (started = false))
  }
  const name = (x?: Localized | null) => {
    if (!x) return ''
    if (locale.value === 'en') return x.en || x.name
    if (locale.value === 'es') return x.es || x.en || x.name
    return x.name
  }
  // Encounter places carry a floor/part suffix ("Mont Creuset (Ss1)"): translate the base, keep the suffix.
  const place = (fr: string) => {
    if (locale.value === 'fr') return fr
    // Suffixes: " (Ss1)" for encounter places, " · Feu" for the 7 Hells triple gym (Ogoesse).
    const m = fr.match(/^(.*?)( \(.*\)| · .*)?$/)!
    const tr = places.value[m[1]!]
    const parts = PARTS[locale.value] ?? {}
    const words = (x: string) => x.split(' ').map(w => floor(w) ?? parts[w] ?? w).filter(Boolean).join(' ')
    const suffix = m[2] && (m[2].startsWith(' (') ? ` (${words(m[2].slice(2, -1))})` : ` · ${words(m[2].slice(3))}`)
    return (tr ? tr[locale.value === 'en' ? 0 : 1] : m[1]!) + (suffix || '')
  }
  // Index = nature_string_id - 180000 (game order).
  const nature = (i: number) => name(natures.value[i]) || (NATURES_FR[i] ?? '')
  // A collection mon: its nickname if it has one, else the species name in the current language.
  const monName = (m: { name: string, species_name: string }, sp?: Localized | null) => (m.name !== m.species_name || !sp ? m.name : name(sp))
  // Encounter kinds and seasons are French strings from the game: i18n keys are their letters only.
  const slug = (s: string) => s.normalize('NFD').replace(/[^a-z]/gi, '')
  const kind = (k: string) => t(`kinds.${slug(k)}`)
  const season = (k: string) => t(`seasons.${slug(k)}`)
  const egg = (k: string) => t(`eggs.${slug(k)}`)
  // Encounter rarity: a percentage, or a word for special encounters ("Leurre" = lure only, "Phéno" = phenomenon).
  const rarity = (r: string) => /^[A-Za-zÀ-ÿ]+$/.test(r) ? t(`rarity.${slug(r)}`) : r
  return { locale, name, place, nature, monName, kind, season, egg, rarity }
}
