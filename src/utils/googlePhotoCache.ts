const GOOGLE_PHOTO_STORAGE_KEY = 'slashie.googlePhotoUrl'

/** Decode Google ID token payload (unsigned) for the profile `picture` claim. */
export function googlePictureFromIdToken(idToken: string): string | null {
  try {
    const payloadPart = idToken.split('.')[1]
    if (!payloadPart) return null
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as { picture?: unknown }
    return typeof payload.picture === 'string' && payload.picture.trim()
      ? payload.picture.trim()
      : null
  } catch {
    return null
  }
}

export function cacheGooglePhotoUrl(url: string | null | undefined) {
  if (typeof window === 'undefined') return
  const trimmed = url?.trim()
  if (!trimmed) {
    window.sessionStorage.removeItem(GOOGLE_PHOTO_STORAGE_KEY)
    return
  }
  window.sessionStorage.setItem(GOOGLE_PHOTO_STORAGE_KEY, trimmed)
}

export function readCachedGooglePhotoUrl(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(GOOGLE_PHOTO_STORAGE_KEY)?.trim() || null
}

export function clearCachedGooglePhotoUrl() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(GOOGLE_PHOTO_STORAGE_KEY)
}
