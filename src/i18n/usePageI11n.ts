'use client'

import { useLocale } from './LocaleProvider'
import { type PageI11nBag, loadPageI11n } from './loadPageI11n'

export function usePageI11n<T extends Record<string, unknown>>(
  bag: PageI11nBag<T>,
): T {
  return loadPageI11n(bag, useLocale())
}
