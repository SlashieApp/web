/**
 * Demo marketing task pins for the hero COBE globe.
 * Coordinates only — user-facing captions live in marketing `i11n.json`.
 */
export type HeroGlobeMarker = {
  id: string
  location: [number, number]
  size: number
}

export const HERO_GLOBE_MARKERS: readonly HeroGlobeMarker[] = [
  { id: 'london', location: [51.5074, -0.1278], size: 0.05 },
  { id: 'nyc', location: [40.7128, -74.006], size: 0.055 },
  { id: 'tokyo', location: [35.6762, 139.6503], size: 0.05 },
  { id: 'hongkong', location: [22.3193, 114.1694], size: 0.05 },
  { id: 'sydney', location: [-33.8688, 151.2093], size: 0.045 },
  { id: 'singapore', location: [1.3521, 103.8198], size: 0.045 },
] as const

/** Slashie brand green `#00DC82` as COBE RGB (0–1). */
export const HERO_GLOBE_MARKER_COLOR: [number, number, number] = [0, 0.86, 0.51]

/** Dark ink land mass matching `bg.inverted` / `#0C1310`. */
export const HERO_GLOBE_BASE_COLOR: [number, number, number] = [0.07, 0.1, 0.08]

/** Soft green-ink atmosphere glow. */
export const HERO_GLOBE_GLOW_COLOR: [number, number, number] = [
  0.12, 0.22, 0.16,
]
