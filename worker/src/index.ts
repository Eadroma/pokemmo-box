// Receives Alphapedia webhooks (alphas + swarms) and serves the latest ones to the static site.
//   POST /hook/<HOOK_SECRET>  ← Alphapedia "Custom Webhook" target
//   GET  /events              → JSON list, newest first
import { pushEvent, type StoredEvent } from './events'

interface Env {
  EVENTS: KVNamespace
  HOOK_SECRET: string
}

const KEY = 'events'
const MAX_BODY = 64 * 1024
const cors = { 'Access-Control-Allow-Origin': '*' }
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors } })

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url)

    if (req.method === 'GET' && pathname === '/events') return json((await env.EVENTS.get<StoredEvent[]>(KEY, 'json')) ?? [])

    if (req.method === 'POST' && pathname === `/hook/${env.HOOK_SECRET}`) {
      const text = await req.text()
      if (text.length > MAX_BODY) return json({ error: 'too large' }, 413)
      let payload: unknown
      try {
        payload = JSON.parse(text)
      }
      catch { payload = text } // format undocumented: keep non-JSON bodies too
      // shortcut: read-modify-write on one KV key can drop an event if two arrive in the same instant;
      // fine at Alphapedia's rate (a few per hour), switch to a Durable Object if it ever matters.
      const list = (await env.EVENTS.get<StoredEvent[]>(KEY, 'json')) ?? []
      await env.EVENTS.put(KEY, JSON.stringify(pushEvent(list, { receivedAt: Date.now(), payload })))
      return json({ ok: true })
    }

    return json({ error: 'not found' }, 404)
  },
}
