// Alphapedia doesn't document its custom-webhook payload, so events are stored as received.
export interface StoredEvent { receivedAt: number, payload: unknown }

export const MAX_EVENTS = 200 // ~1.5 day of swarms, so rarer alphas are not pushed out before they despawn

// Newest first, capped: the site only needs what is currently live.
export const pushEvent = (list: StoredEvent[], ev: StoredEvent, max = MAX_EVENTS): StoredEvent[] => [ev, ...list].slice(0, max)
