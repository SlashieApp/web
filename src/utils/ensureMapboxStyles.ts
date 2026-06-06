let loadPromise: Promise<void> | null = null

/** Load Mapbox GL CSS on demand (avoids unused CSS preload on non-map routes). */
export function ensureMapboxStyles(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (!loadPromise) {
    loadPromise = import('mapbox-gl/dist/mapbox-gl.css').then(() => undefined)
  }
  return loadPromise
}
