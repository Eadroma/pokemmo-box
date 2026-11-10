import type { BoxMon } from './useCollection'

// An empty name is shown as the translated default ("Équipe N").
export interface Team { name: string, members: BoxMon[] }

// Members are copies, so a team survives re-importing the collection.
export function useTeams() {
  const teams = usePersisted<Team[]>('pokemmo:teams', [{ name: '', members: [] }])
  const current = usePersisted<number>('pokemmo:team-current', 0)
  const team = computed(() => teams.value[current.value] ?? teams.value[0]!)
  const add = (m: BoxMon) => {
    if (team.value.members.length < 6) team.value.members.push(structuredClone(toRaw(m)))
  }
  return { teams, current, team, add }
}
