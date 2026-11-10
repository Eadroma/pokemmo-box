<script setup lang="ts">
// Language flags + light/dark toggle. The theme is applied before paint by the inline script in nuxt.config.ts.
const { locale, setLocale, t } = useI18n()
// Remembered for a year; app/plugins/locale.client.ts applies it on the next visit.
const lang = useCookie('pokemmo_lang', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
function pick(code: 'fr' | 'en' | 'es') {
  lang.value = code
  setLocale(code)
}
const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const

const theme = ref<'light' | 'dark'>('light')
onMounted(() => {
  const forced = document.documentElement.dataset.theme
  theme.value = forced === 'dark' || (!forced && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
})
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  try {
    localStorage.setItem('pokemmo:theme', theme.value)
  }
  catch { /* private mode: the choice lasts until reload */ }
}
</script>

<template>
  <div class="prefs">
    <button
      v-for="l in LANGS"
      :key="l.code"
      type="button"
      class="flag"
      :aria-pressed="locale === l.code"
      :aria-label="l.label"
      :title="l.label"
      :lang="l.code"
      @click="pick(l.code)"
    >
      <svg
        viewBox="0 0 30 20"
        width="24"
        height="16"
        aria-hidden="true"
      >
        <template v-if="l.code === 'fr'">
          <rect
            width="10"
            height="20"
            fill="#0055a4"
          /><rect
            x="10"
            width="10"
            height="20"
            fill="#fff"
          /><rect
            x="20"
            width="10"
            height="20"
            fill="#ef4135"
          />
        </template>
        <template v-else-if="l.code === 'es'">
          <rect
            width="30"
            height="20"
            fill="#aa151b"
          /><rect
            y="5"
            width="30"
            height="10"
            fill="#f1bf00"
          />
        </template>
        <template v-else>
          <rect
            width="30"
            height="20"
            fill="#012169"
          />
          <path
            d="M0 0 30 20M30 0 0 20"
            stroke="#fff"
            stroke-width="4"
          />
          <path
            d="M0 0 30 20M30 0 0 20"
            stroke="#c8102e"
            stroke-width="1.5"
          />
          <path
            d="M15 0v20M0 10h30"
            stroke="#fff"
            stroke-width="6"
          />
          <path
            d="M15 0v20M0 10h30"
            stroke="#c8102e"
            stroke-width="3.4"
          />
        </template>
      </svg>
    </button>
    <button
      type="button"
      class="theme"
      :aria-label="t(theme === 'dark' ? 'prefs.toLight' : 'prefs.toDark')"
      :title="t(theme === 'dark' ? 'prefs.toLight' : 'prefs.toDark')"
      @click="toggleTheme"
    >
      <svg
        v-if="theme === 'dark'"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      ><circle
        cx="12"
        cy="12"
        r="4.5"
      /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        aria-hidden="true"
      ><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" /></svg>
    </button>
  </div>
</template>

<style scoped>
.prefs { display: flex; align-items: center; gap: 2px; margin-left: auto; flex: none; }
.flag, .theme { min-height: 34px; padding: 0 6px; background: transparent; display: grid; place-items: center; }
.flag svg { display: block; border-radius: 2px; opacity: .55; filter: saturate(.6); }
.flag:hover svg { opacity: .9; }
.flag[aria-pressed="true"] svg { opacity: 1; filter: none; outline: 2px solid var(--accent); outline-offset: 2px; }
.theme { color: var(--muted); margin-left: 4px; }
.theme:hover { color: var(--text); }
</style>
