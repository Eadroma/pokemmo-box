// Guide notes (7 Hells route, team roles, Amulet Coin steps) are written in French in app/utils/*.ts.
// i18n/guides/<lang>.json maps each French sentence to its translation; a missing one shows the French text.
// test/logic.test.ts fails when a guide sentence has no translation, so edits can't silently stay French.
type Map = Record<string, string>
const LOADERS: Record<string, () => Promise<{ default: Map }>> = {
  en: () => import('../../i18n/guides/en.json'),
  es: () => import('../../i18n/guides/es.json'),
}
const maps = shallowRef<Record<string, Map>>({})

export function useGuideText() {
  const { locale } = useI18n()
  watchEffect(() => {
    const l = locale.value
    if (LOADERS[l] && !maps.value[l]) LOADERS[l]().then(m => (maps.value = { ...maps.value, [l]: m.default }), () => {})
  })
  return (fr?: string) => (fr ? maps.value[locale.value]?.[fr] ?? fr : '')
}
