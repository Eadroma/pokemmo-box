import type { BoxMon } from '../composables/useCollection.ts'
import { clean } from '../composables/useCollection.ts'

// Team share links: the team as deflated JSON in base64url, so it fits a URL without any server.
const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
const pipe = async (data: Uint8Array, stream: CompressionStream | DecompressionStream) =>
  new Uint8Array(await new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream)).arrayBuffer())

export async function encodeTeam(name: string, members: BoxMon[]) {
  return toB64(await pipe(new TextEncoder().encode(JSON.stringify({ n: name, m: members })), new CompressionStream('deflate-raw')))
}

// Untrusted (anyone can craft a link): members go through the same cleaning as an imported file. Null if unreadable.
export async function decodeTeam(code: string): Promise<{ name: string, members: BoxMon[] } | null> {
  try {
    const raw = JSON.parse(new TextDecoder().decode(await pipe(fromB64(code), new DecompressionStream('deflate-raw'))))
    const members = clean(raw?.m).slice(0, 6)
    return members.length ? { name: typeof raw.n === 'string' ? raw.n.slice(0, 40) : '', members } : null
  }
  catch { return null }
}
