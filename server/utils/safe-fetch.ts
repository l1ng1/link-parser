import { lookup as dnsLookup, type LookupAddress } from 'node:dns'
import type { LookupFunction } from 'node:net'
import ipaddr from 'ipaddr.js'
import { Agent, fetch, type Response } from 'undici'

// The server downloads whatever URL a user sends. Without these checks a user could make
// it request internal addresses (localhost, the hosting provider's metadata service,
// private networks) and read the answer back through the saved item. That is SSRF.

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])
const ALLOWED_PORTS = new Set(['', '80', '443'])
const MAX_REDIRECTS = 5
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnsafeUrlError'
  }
}

// Only ordinary public addresses pass. ipaddr.js labels everything else: loopback,
// private, link-local (cloud metadata lives at 169.254.169.254), carrier-grade NAT,
// multicast, reserved and the IPv6 tunnelling ranges that can wrap a private IPv4.
export function isPublicAddress(address: string): boolean {
  if (!ipaddr.isValid(address)) return false
  return ipaddr.process(address).range() === 'unicast'
}

// Checks that need no network: scheme, port, credentials and literal IPs.
// Hostnames are checked later, at connection time, against every address DNS returns.
export function assertSafeUrl(input: string | URL): URL {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new UnsafeUrlError('Not a valid URL')
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) throw new UnsafeUrlError('Only http and https links are allowed')
  if (!ALLOWED_PORTS.has(url.port)) throw new UnsafeUrlError('Only standard ports are allowed')
  if (url.username || url.password) throw new UnsafeUrlError('Links with credentials are not allowed')

  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost')) throw new UnsafeUrlError('Local addresses are not allowed')
  if (ipaddr.isValid(host) && !isPublicAddress(host)) throw new UnsafeUrlError('Private addresses are not allowed')

  return url
}

// Runs on every new connection, including the ones made after a redirect. Checking here,
// and not only before the request, closes DNS rebinding: a host that resolves to a public
// IP during validation and to 127.0.0.1 a moment later still gets refused.
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses: LookupAddress[]) => {
    if (err) return callback(err, '', 0)
    const blocked = addresses.find((entry) => !isPublicAddress(entry.address))
    if (blocked || addresses.length === 0) {
      const error = new UnsafeUrlError(`${hostname} resolves to a private address`)
      return callback(error, '', 0)
    }
    if (options.all) return callback(null, addresses)
    const first = addresses[0]!
    callback(null, first.address, first.family)
  })
}

const agent = new Agent({ connect: { lookup: safeLookup } })

interface SafeFetchOptions {
  accept?: string
  timeoutMs?: number
}

export interface SafeResponse {
  response: Response
  url: URL
}

// fetch() with the checks above. Redirects are followed by hand so every hop is validated.
export async function safeFetch(input: string, options: SafeFetchOptions = {}): Promise<SafeResponse> {
  const signal = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  let url = assertSafeUrl(input)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url, {
      dispatcher: agent,
      redirect: 'manual',
      signal,
      headers: {
        accept: options.accept ?? 'text/html,application/xhtml+xml',
        'user-agent': 'Mozilla/5.0 (compatible; link-parsser/1.0; +https://github.com/l1ng1/link-parser)',
      },
    })

    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel()
      url = assertSafeUrl(new URL(location, url))
      continue
    }

    if (!response.ok) {
      await response.body?.cancel()
      throw new Error(`${url.hostname} answered with ${response.status}`)
    }

    return { response, url }
  }

  throw new Error('Too many redirects')
}

// Reads the body as text but stops at maxBytes, so a huge or endless response
// can't eat the server's memory. Honors the charset from the Content-Type header.
export async function readTextLimited(response: Response, maxBytes = DEFAULT_MAX_BYTES): Promise<string> {
  if (!response.body) return ''

  const chunks: Uint8Array[] = []
  let total = 0
  for await (const chunk of response.body) {
    total += chunk.byteLength
    if (total > maxBytes) {
      await response.body.cancel()
      throw new Error('Page is too large')
    }
    chunks.push(chunk)
  }

  const charset = /charset=([^;]+)/i.exec(response.headers.get('content-type') ?? '')?.[1]?.trim()
  let decoder: TextDecoder
  try {
    decoder = new TextDecoder(charset || 'utf-8')
  } catch {
    decoder = new TextDecoder('utf-8')
  }
  return decoder.decode(Buffer.concat(chunks))
}
