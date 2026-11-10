// The site is prerendered in French. Applying the visitor's language before hydration made every EN/ES page
// mismatch its HTML, so the saved choice (or the browser's language on a first visit) is applied right after.
const LANG_COOKIE = 'pokemmo_lang'
const SUPPORTED = ['fr', 'en', 'es'] as const

export default defineNuxtPlugin((nuxtApp) => {
  const saved = useCookie<string | null>(LANG_COOKIE).value
  const browser = navigator.languages.map(l => l.slice(0, 2)).find(l => (SUPPORTED as readonly string[]).includes(l))
  const want = saved && (SUPPORTED as readonly string[]).includes(saved) ? saved : browser
  if (!want || want === 'fr') return
  nuxtApp.hooks.hookOnce('app:suspense:resolve', () => nuxtApp.$i18n.setLocale(want as typeof SUPPORTED[number]))
})
