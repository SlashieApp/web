export type BrowseReferenceSource = 'geolocation' | 'manual' | 'default'

export type BrowseReferenceLocation = {
  lat: number
  lng: number
  label: string
  source: BrowseReferenceSource
}

export const CURRENT_LOCATION_LABEL = 'Current location'

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
