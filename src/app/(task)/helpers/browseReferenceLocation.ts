export type BrowseReferenceSource = 'geolocation' | 'manual' | 'default'

export type BrowseReferenceLocation = {
  lat: number
  lng: number
  label: string
  source: BrowseReferenceSource
}

export const CURRENT_LOCATION_LABEL = 'Current location'

/** Placeholder label for centers hydrated from a shared /search URL (lat/lng only) until reverse geocoding resolves a name. */
export const URL_SEEDED_AREA_LABEL = 'Shared area'

export const DEFAULT_BROWSE_REFERENCE: BrowseReferenceLocation = {
  lat: 51.5074,
  lng: -0.1278,
  label: 'London',
  source: 'default',
}

export type BrowseGeolocationStatus =
  | 'idle'
  | 'pending'
  | 'granted'
  | 'denied'
  | 'unsupported'

/** Whether we may call `getCurrentPosition` without showing a permission prompt. */
export async function browseGeolocationPermission(): Promise<
  'granted' | 'denied' | 'prompt' | 'unsupported'
> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported'
  }
  const permissions = navigator.permissions
  if (!permissions?.query) {
    // Safari / older browsers — never auto-prompt on page load.
    return 'prompt'
  }
  try {
    const status = await permissions.query({
      name: 'geolocation' as PermissionName,
    })
    if (status.state === 'granted') return 'granted'
    if (status.state === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'prompt'
  }
}
