// Builds the static site and uploads it to Cloudflare Pages. Run from a machine that has the game data
// (`npm run data` first): the sprites and data aren't in the repo, so CI can't build the site.
// Usage: npm run deploy   (needs `npx wrangler@4 login` once)
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const PROJECT = 'pokemmo-box'
const SITE = process.env.NUXT_PUBLIC_SITE_URL || `https://${PROJECT}.pages.dev`

if (!existsSync('public/data/species.json') || !existsSync('public/sprites/icon')) {
  console.error('Game data missing: run `npm run data` first (see README).')
  process.exit(1)
}
const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

run('npm run check')
run('npx nuxi generate', { NUXT_PUBLIC_SITE_URL: SITE })
const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
run(`npx wrangler@4 pages deploy .output/public --project-name ${PROJECT} --branch ${branch} --commit-dirty=true`, { CI: '1', WRANGLER_SEND_METRICS: 'false' })
console.log(`\nDeployed: ${SITE}`)
