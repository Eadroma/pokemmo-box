# PokeMMO Box

Site Nuxt 4 (statique) pour PokeMMO : Pokédex, collection perso, team builder, simulateur d'élevage, baies,
cosmétiques, alphas et essaims en direct, guides (Pièce Rune, 7 Hells, EVs, shiny, objets). En français, anglais et espagnol.

## Données

Les données viennent du jeu lui-même : en jeu, « Exporter ressources moddables » crée
`C:\Program Files\PokeMMO\dump\resources\dump.zip`. Puis :

```sh
npm run data                     # ou: npm run data -- "D:\autre\chemin\dump"
```

Ça génère `public/data/*.json` et `public/sprites/*`. Ces fichiers appartiennent à Nintendo / GAME FREAK et à PokeMMO :
ils ne sont **pas versionnés**, chacun les génère depuis son propre jeu. Les noms anglais et espagnols viennent de
PokeAPI, les sets recommandés de Smogon (Gen 5). À relancer après une mise à jour du jeu.

## Commandes

```sh
npm install
npm run dev        # http://localhost:3000
npm run generate   # site statique dans .output/public (Netlify, Cloudflare Pages…)
npm test           # logique : types, stats, Showdown, élevage, zip
npm run lint       # ESLint (Nuxt + style + i18n) ; lint:fix pour corriger
npm run typecheck  # vue-tsc
npm run check      # les trois
```

Aucun texte en dur dans les templates : la règle `@intlify/vue-i18n/no-raw-text` l'interdit.
Tout passe par `i18n/locales/fr.json` et `$t()`.

La collection et les équipes restent dans le navigateur (localStorage) : rien n'est envoyé à un serveur.

## Alphas et essaims (Worker Cloudflare)

`worker/` reçoit les webhooks d'[Alphapedia](https://alpha.pokemmotools.org) et sert les 200 derniers au site.

- `POST /hook/<secret>` : cible du « Custom Webhook » Alphapedia (portée « Alphas and Swarms », français).
- `GET /events` : liste JSON, du plus récent au plus ancien.

```sh
cd worker
npx wrangler@4 login
npx wrangler@4 deploy
npx wrangler@4 secret put HOOK_SECRET < .secret   # .secret n'est pas versionné
```

Conditions Alphapedia : tout affichage public doit créditer Alphapedia et faire un lien vers le `shareUrl` de chaque événement.

## Licence

Code source visible, **tous droits réservés** : voir [LICENSE](LICENSE). Les issues et pull requests sont les bienvenues ;
toute copie, réutilisation ou mise en ligne du code demande une autorisation écrite.

Projet de fan, sans lien avec Nintendo, The Pokémon Company, GAME FREAK ou PokeMMO.
