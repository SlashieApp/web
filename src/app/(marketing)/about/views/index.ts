import { guest } from './guest'
import { signedIn } from './signedIn'
import type { AboutView, AboutViewConfig } from './types'

export const ABOUT_VIEWS: Record<AboutView, AboutViewConfig> = {
  guest,
  signedIn,
}

export { getAboutView } from './getAboutView'
export type { AboutViewInput } from './getAboutView'
export type { AboutAction, AboutView, AboutViewConfig } from './types'
