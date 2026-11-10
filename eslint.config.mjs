// @ts-check
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  ...vueI18n.configs.recommended,
  {
    settings: {
      'vue-i18n': { localeDir: './i18n/locales/*.json', messageSyntaxVersion: '^11.0.0' },
    },
    rules: {
      // Every visible text goes through $t(); only pure symbols/numbers may stay inline.
      '@intlify/vue-i18n/no-raw-text': ['error', { ignorePattern: '^[\\s\\d#:()×✕✓★☆·/+\\-–—‹›←→↑%.,]+$' }],
      '@intlify/vue-i18n/no-missing-keys': 'error',
      '@intlify/vue-i18n/no-unused-keys': ['error', {
        extensions: ['.ts', '.vue'],
        // Built at runtime (`types.${t}`, error keys thrown by parsers, key lists in arrays): the plugin can't see them.
        ignores: ['/^types\\./', '/^stats\\./', '/^boxes\\./', '/^errors\\./', '/^pokedex\\.how\\./', '/^nav\\./', '/^home\\./', '/^team\\.option/', '/^cosmetics\\.slot\\./', '/^swarms\\.(heading|none)\\./', '/^guides\\.hells\\.(tab\\.|gym)/', '/^guides\\.(rune|hells|evs|shiny|items)\\.card$/', '/^guides\\.evs\\.(preset\\.|morning|day|night)/', '/^guides\\.rune\\.(hordes|coins|claws)$/', '/^prefs\\./', '/^collection\\.audit\\./', '/^watch\\.notif\\./', '/^kinds\\./', '/^seasons\\./', '/^eggs\\./', '/^cats\\./', '/^rarity\\./', '/^guides\\.evs\\.berryName\\./'],
      }],
      'vue/no-multiple-template-root': 'off', // Vue 3 supports fragments
      '@intlify/vue-i18n/no-dynamic-keys': 'off', // types.${type} / stats.${k} are intentional
      '@intlify/vue-i18n/no-v-html': 'error',
    },
  },
  { ignores: ['public/**', '.cache/**', '.output/**'] },
)
