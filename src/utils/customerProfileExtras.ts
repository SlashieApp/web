'use client'

export type CustomerProfileExtras = {
  location: string
  bio: string
  /** Data URL or remote URL for session-only avatar override */
  avatarOverride?: string | null
}

const storageKey = (userId: string) =>
  `slashie_customer_profile_extras:${userId}`

export function loadCustomerProfileExtras(
  userId: string,
): CustomerProfileExtras {
  if (typeof window === 'undefined') {
    return { location: '', bio: '', avatarOverride: null }
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey(userId))
    if (!raw) return { location: '', bio: '', avatarOverride: null }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') {
      return { location: '', bio: '', avatarOverride: null }
    }
    const o = parsed as Record<string, unknown>
    return {
      location: typeof o.location === 'string' ? o.location : '',
      bio: typeof o.bio === 'string' ? o.bio : '',
      avatarOverride:
        typeof o.avatarOverride === 'string' ? o.avatarOverride : null,
    }
  } catch {
    return { location: '', bio: '', avatarOverride: null }
  }
}

export function saveCustomerProfileExtras(
  userId: string,
  extras: CustomerProfileExtras,
) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(storageKey(userId), JSON.stringify(extras))
  } catch {
    // ignore quota / private mode
  }
}
