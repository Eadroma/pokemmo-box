import { readFileSync, existsSync } from 'node:fs'

// Empty until `npm run data` has been run once.
const species = (): { id: number }[] =>
  existsSync('public/data/species.json') ? JSON.parse(readFileSync('public/data/species.json', 'utf8')) : []

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'PokeMMO Box',
      // Fallbacks for the client-only pages (their prerendered HTML is an empty shell); each page sets its own.
      meta: [
        { name: 'description', content: 'Outils pour PokeMMO : Pokédex, collection, team builder, élevage, guides et alphas en direct, à partir des données du jeu.' },
        { name: 'theme-color', content: '#12221e' },
        { property: 'og:site_name', content: 'PokeMMO Box' },
      ],
      // Apply the saved theme before first paint (no light flash on a dark choice).
      script: [{ innerHTML: 'try{var t=localStorage.getItem("pokemmo:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}' }],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400..700&family=Pixelify+Sans:wght@500;600&display=swap' },
      ],
    },
  },
  css: ['~/assets/main.css'],
  // Public URL of the deployed site (NUXT_PUBLIC_SITE_URL): canonical links, og:url, sitemap.
  runtimeConfig: { public: { siteUrl: '' } },
  // These pages live in localStorage: render them in the browser only.
  routeRules: { '/collection': { ssr: false }, '/team': { ssr: false }, '/baies': { ssr: false }, '/cosmetiques': { ssr: false }, '/essaims': { ssr: false }, '/guides/**': { ssr: false }, '/elevage': { ssr: false } },
  compatibilityDate: '2026-11-01',
  // Every Pokédex page, including unobtainable species the list hides by default (so the crawler misses them).
  // autoSubfolderIndex false: /pokedex/445.html, which Cloudflare Pages serves at /pokedex/445 (no slash redirect, matches canonical URLs).
  nitro: { prerender: { crawlLinks: true, autoSubfolderIndex: false, routes: ['/', '/sitemap.xml', '/robots.txt', ...species().map(s => `/pokedex/${s.id}`)] } },
  eslint: { config: { stylistic: true } },
  i18n: {
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    locales: [{ code: 'fr', language: 'fr-FR', file: 'fr.json' }, { code: 'en', language: 'en-GB', file: 'en.json' }, { code: 'es', language: 'es-ES', file: 'es.json' }],
    // The flag choice is kept in a cookie; the first visit follows the browser language.
    detectBrowserLanguage: { useCookie: true, cookieKey: 'pokemmo_lang', fallbackLocale: 'fr' },
  },
})
