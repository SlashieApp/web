import type { AboutView } from './types'

export type AboutViewInput = {
  /** The request has a session cookie (read on the server). */
  session: 'guest' | 'signedIn'
}

export function getAboutView({ session }: AboutViewInput): AboutView {
  return session === 'signedIn' ? 'signedIn' : 'guest'
}
