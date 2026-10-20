/** Bytes of randomness in a Sign in with Apple nonce (256 bits). */
export const APPLE_NONCE_BYTES = 32

export type AppleNonce = {
  /** Sent to the API as `nonce`; it checks the token against its hash. */
  raw: string
  /** SHA-256 hex of `raw`, given to Apple so the identity token carries it. */
  hashed: string
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

/** SHA-256 of a UTF-8 string, as lowercase hex. */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )
  return toHex(new Uint8Array(digest))
}

/**
 * A fresh nonce for one Sign in with Apple attempt. The raw value stays with
 * this page and goes to the API; Apple only ever sees the hash, so a token
 * lifted from elsewhere can't be replayed here.
 */
export async function createAppleNonce(): Promise<AppleNonce> {
  const bytes = new Uint8Array(APPLE_NONCE_BYTES)
  crypto.getRandomValues(bytes)
  const raw = toHex(bytes)
  return { raw, hashed: await sha256Hex(raw) }
}
