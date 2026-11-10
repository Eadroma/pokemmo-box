# PokeMMO Box

[![CI](https://github.com/Eadroma/pokemmo-box/actions/workflows/ci.yml/badge.svg)](https://github.com/Eadroma/pokemmo-box/actions/workflows/ci.yml)

A static Nuxt 4 site with tools for [PokeMMO](https://pokemmo.com), built from the data the game itself exports.
Available in French, English and Spanish, with a light and a dark theme.

- **Pokédex**: all 649 Pokémon with locations, hordes, abilities, moves, EV yield and Smogon sets; search by any mix of moves and abilities; living-dex progress from your collection.
- **Collection**: import your game export to see every Pokémon with IVs, EVs and natures, a verdict for each (ready for a guide, good breeding parent, Smogon nature, release) and a one-click Showdown export.
- **Team builder**: level 50 stats, weaknesses, offensive coverage, Showdown export and shareable team links.
- **Breeding simulator**: parents, Braces and Everstones for a 5x31 with nature, and which of your Pokémon already cover part of the tree.
- **Live alphas and swarms** from [Alphapedia](https://alpha.pokemmotools.org), with browser notifications for the species you watch.
- **Guides** linked to your collection: Amulet Coin farming, the 7 Hells gym route, EV training with live tracking, shiny hunting, item farming.
- **Berries and cosmetics** trackers.

Your collection and teams stay in your browser (localStorage): nothing is sent to a server.

## Game data

Game data and sprites are **not in this repository**: they belong to Nintendo / GAME FREAK and to PokeMMO.
Generate them from your own game client. In game, use **Export moddable resources** (and **Export strings to XML**),
which writes `C:\Program Files\PokeMMO\dump\resources\dump.zip`. Then:

```sh
npm run data                     # or: npm run data -- "D:\other\path\dump"
```

This writes `public/data/*.json` and `public/sprites/*`. English and Spanish names come from
[PokeAPI](https://pokeapi.co), recommended sets from [Smogon](https://www.smogon.com) (Gen 5, the closest to PokeMMO).
Run it again after a game update.

## Commands

```sh
npm install
npm run dev        # http://localhost:3000
npm run generate   # static site in .output/public (Netlify, Cloudflare Pages…)
npm test           # game logic: types, stats, Showdown, breeding, zip, guides, translations
npm run lint       # ESLint (Nuxt + stylistic + i18n); lint:fix to fix
npm run typecheck  # vue-tsc
npm run check      # all three, as in CI
```

Set `NUXT_PUBLIC_SITE_URL` (e.g. `https://pokemmo-box.example`) when generating the deployed site: it fills the
canonical links, `og:url`, `og:image`, `sitemap.xml` and the sitemap line of `robots.txt`.

### Deploy

The site is hosted on Cloudflare Pages: <https://pokemmo-box.pages.dev>. CI can't build it (the game data isn't in
the repo), so deploy from a machine that ran `npm run data`:

```sh
npx wrangler@4 login   # once
npm run deploy         # checks, builds with NUXT_PUBLIC_SITE_URL, uploads .output/public to the pokemmo-box Pages project
```

### Translations

No raw text in templates: the `@intlify/vue-i18n/no-raw-text` rule forbids it. UI strings live in
`i18n/locales/{fr,en,es}.json`. Guide notes are written in French in `app/utils/` and translated in
`i18n/guides/{en,es}.json`; a test fails when a guide sentence has no translation.

## Live alphas and swarms (Cloudflare Worker)

`worker/` receives [Alphapedia](https://alpha.pokemmotools.org) webhooks and serves the latest 200 events to the site.

- `POST /hook/<secret>`: target of the Alphapedia “Custom Webhook” (scope “Alphas and Swarms”).
- `GET /events`: JSON list, newest first.

```sh
cd worker
npx wrangler@4 login
npx wrangler@4 deploy
npx wrangler@4 secret put HOOK_SECRET < .secret   # .secret is not versioned
```

Alphapedia's terms: any public display must credit Alphapedia and link to each event's `shareUrl`.

## Credits

Guides are adapted from [Eevelen Terminal](https://eevelen-pokemmo.vercel.app), the community route
“Seven Hells · Lucky Girl Syndrome”, the [PokeMMO Wiki](https://pokemmo.shoutwiki.com) and
[Pikammo](https://www.pikammo.fr). Data: the PokeMMO client export, PokeAPI, Smogon and Alphapedia.

## License

Source available, **all rights reserved**: see [LICENSE](LICENSE). Issues and pull requests are welcome; copying,
reusing or hosting the code requires written permission.

PokeMMO Box is a fan project, not affiliated with Nintendo, The Pokémon Company, GAME FREAK or PokeMMO.
