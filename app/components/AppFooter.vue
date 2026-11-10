<script setup lang="ts">
// Credits for every source the site draws on (Alphapedia's webhook terms require the credit + link),
// copyright and the fan-project disclaimer. Site and author names stay as they are in every language.
const REPO = 'https://github.com/Eadroma/pokemmo-box'
const DATA = [
  { name: 'PokeAPI', href: 'https://pokeapi.co', key: 'footer.pokeapi' },
  { name: 'Smogon', href: 'https://www.smogon.com/dex/bw/', key: 'footer.smogon' },
  { name: 'Alphapedia', href: ALPHAPEDIA, key: 'footer.alphapedia' },
]
const GUIDES = [
  { name: 'Eevelen Terminal', href: 'https://eevelen-pokemmo.vercel.app', key: 'footer.eevelen' },
  { name: 'Seven Hells · Lucky Girl Syndrome', key: 'footer.hells' },
  { name: 'PokeMMO Wiki', href: 'https://pokemmo.shoutwiki.com', key: 'footer.wiki' },
  { name: 'Pikammo', href: 'https://www.pikammo.fr', key: 'footer.pikammo' },
]
const YEAR = 2026
const OWNER = 'Eadroma'
</script>

<template>
  <footer class="foot">
    <div class="inner">
      <div class="about">
        <strong>{{ $t('app.name') }}</strong>
        <p>{{ $t('footer.about') }}</p>
      </div>
      <div>
        <h2>{{ $t('footer.data') }}</h2>
        <ul>
          <li>{{ $t('footer.game') }}</li>
          <li
            v-for="c in DATA"
            :key="c.name"
          >
            <a
              :href="c.href"
              target="_blank"
              rel="noopener"
            >{{ c.name }}</a> · {{ $t(c.key) }}
          </li>
        </ul>
      </div>
      <div>
        <h2>{{ $t('footer.guides') }}</h2>
        <ul>
          <li
            v-for="c in GUIDES"
            :key="c.name"
          >
            <a
              v-if="c.href"
              :href="c.href"
              target="_blank"
              rel="noopener"
            >{{ c.name }}</a><span v-else>{{ c.name }}</span> · {{ $t(c.key) }}
          </li>
        </ul>
      </div>
      <div>
        <h2>{{ $t('footer.project') }}</h2>
        <ul>
          <li>
            <a
              :href="REPO"
              target="_blank"
              rel="noopener"
            >{{ $t('footer.source') }}</a>
          </li>
          <li>
            <a
              :href="`${REPO}/blob/master/LICENSE`"
              target="_blank"
              rel="noopener"
            >{{ $t('footer.license') }}</a>
          </li>
          <li>
            <a
              :href="`${REPO}/issues`"
              target="_blank"
              rel="noopener"
            >{{ $t('footer.issues') }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="legal">
      <p>{{ $t('footer.copyright', { year: YEAR, owner: OWNER }) }}</p>
      <p>{{ $t('footer.disclaimer') }}</p>
      <p>{{ $t('footer.analytics') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.foot { border-top: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 55%, var(--bg)); font-size: .86rem; color: var(--muted); }
.inner { max-width: 1200px; margin: 0 auto; padding: 32px 16px 20px; display: grid; gap: 24px; grid-template-columns: 1.3fr repeat(3, 1fr); }
@media (max-width: 860px) { .inner { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .inner { grid-template-columns: 1fr; } }
.about strong { font: 600 1.2rem var(--display); color: var(--text); }
.about p { margin: 6px 0 0; max-width: 34ch; }
h2 { margin: 0 0 8px; font-size: .86rem; font-weight: 700; color: var(--text); }
ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
a { color: var(--text); text-underline-offset: 2px; }
a:hover { color: var(--accent); }
.legal { max-width: 1200px; margin: 0 auto; padding: 14px 16px 28px; border-top: 1px solid var(--border); display: grid; gap: 4px; font-size: .78rem; }
.legal p { margin: 0; }
</style>
