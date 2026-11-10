// Title, description, Open Graph / Twitter tags and canonical URL for a page, in the current language.
// Absolute URLs (canonical, og:url, og:image) need NUXT_PUBLIC_SITE_URL at build time; without it they're left out.
const OG_LOCALE: Record<string, string> = { fr: 'fr_FR', en: 'en_GB', es: 'es_ES' }

export function usePageSeo(title: () => string, description: () => string, image?: () => string) {
  const { locale } = useI18n()
  const site = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
  const route = useRoute()
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: 'PokeMMO Box',
    ogLocale: () => OG_LOCALE[locale.value] ?? 'fr_FR',
    twitterCard: 'summary',
    ...(site ? { ogUrl: () => site + route.path } : {}),
    ...(site && image ? { ogImage: () => site + image() } : {}),
  })
  if (site) useHead({ link: [{ rel: 'canonical', href: () => site + route.path }] })
}
