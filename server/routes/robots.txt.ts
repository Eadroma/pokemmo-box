export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl || '').replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ''}`
})
