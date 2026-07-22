'use client'

import { useLocale } from './LocaleProvider'
import { type PageI11nBag, loadPageI11n } from './loadPageI11n'

/**
 * Resolve a colocated `i11n.json` bag for the active locale.
 * Import the bag next to the feature that owns the copy:
 *
 *   import bag from './i11n.json'
 *   const t = useI11n(bag)
 */
export function useI11n<T extends Record<string, unknown>>(
  bag: PageI11nBag<T>,
): T {
  return loadPageI11n(bag, useLocale())
}
