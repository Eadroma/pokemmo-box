// Prerendered at build (nuxt.config.ts): every static page and the 649 Pokédex pages.
const PAGES = ['/', '/pokedex', '/essaims', '/guides', '/guides/piece-rune', '/guides/7-hells', '/guides/evs', '/guides/shiny', '/guides/objets', '/collection', '/team', '/elevage', '/baies', '/cosmetiques']
const DEX = Array.from({ length: 649 }, (_, i) => `/pokedex/${i + 1}`)

export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl || '').replace(/\/$/, '')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  // No site URL configured: an empty but valid sitemap (locations must be absolute).
  const urls = site ? [...PAGES, ...DEX].map(p => `<url><loc>${site}${p}</loc></url>`).join('') : ''
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
})
