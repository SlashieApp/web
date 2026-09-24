import { stripLocalePrefix } from '@/i18n/navigation'

import {
  type PopupCandidate,
  pickLandPopup,
} from '@/content/reviews/reviewModel'

export const POPUP_DISMISS_STORAGE_KEY = 'slashie.notificationPopup.dismissed'

/** Map home must never be covered by a land popup. `/` redirects signed-in users there. */
export function isMapHomePath(pathname: string | null | undefined): boolean {
  const bare = stripLocalePrefix((pathname ?? '/').split('?')[0] || '/')
  return bare === '/' || bare === '/search' || bare.startsWith('/search/')
}

export function readDismissedPopupIds(): Set<string> {
  if (typeof sessionStorage === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(POPUP_DISMISS_STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function rememberDismissedPopupId(id: string): Set<string> {
  const next = readDismissedPopupIds()
  next.add(id)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(POPUP_DISMISS_STORAGE_KEY, JSON.stringify([...next]))
  }
  return next
}

export function nextLandPopup<T extends PopupCandidate>(
  items: readonly T[],
  suppressedIds: ReadonlySet<string>,
  now = Date.now(),
): T | null {
  return pickLandPopup(items, { now, suppressedIds })
}
