import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

import { SDL_PRESS_SCALE, sdlMotion } from '@/theme/styles'

import { PIN, PIN_FONT, PIN_Z_INDEX } from './pin/styles'

/**
 * Task pin clustering (FE-200). Mapbox's GeoJSON source does the grouping;
 * the pins and cluster bubbles stay DOM markers so they keep focus, labels
 * and press feedback.
 */
export const CLUSTER_SOURCE_ID = 'slashie-task-pins'
const CLUSTER_PROBE_LAYER_ID = 'slashie-task-pins-probe'

/** Screen distance (px) under which pins group; about one price pill wide. */
export const CLUSTER_RADIUS_PX = 48

/** Most rows the same-spot list shows. */
export const TASK_STACK_LIMIT = 50

export type ClusterPoint = { id: string; lng: number; lat: number }

export type TaskCluster = {
  id: number
  count: number
  lng: number
  lat: number
}

export type ClusterView = {
  clusters: TaskCluster[]
  /** Task ids drawn on their own at this zoom. */
  loose: Set<string>
}

export function clusterFeatureCollection(
  points: ClusterPoint[],
): GeoJSON.FeatureCollection<GeoJSON.Point, { id: string }> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      properties: { id: p.id },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    })),
  }
}

/**
 * Adds the clustered source once per style. Mapbox only loads a source's
 * tiles while a layer uses it, hence the invisible probe layer.
 * `clusterMaxZoom` is the map's max zoom, so pins at the same spot stay
 * grouped and open the list instead of stacking.
 */
export function ensureClusterSource(
  map: MapboxMap,
  maxZoom: number,
): GeoJSONSource {
  const existing = map.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource | undefined
  if (existing) return existing
  map.addSource(CLUSTER_SOURCE_ID, {
    type: 'geojson',
    data: clusterFeatureCollection([]),
    cluster: true,
    clusterRadius: CLUSTER_RADIUS_PX,
    clusterMaxZoom: maxZoom,
  })
  map.addLayer({
    id: CLUSTER_PROBE_LAYER_ID,
    type: 'circle',
    source: CLUSTER_SOURCE_ID,
    paint: { 'circle-radius': 0, 'circle-opacity': 0 },
  })
  return map.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource
}

/** Clusters (deduped across tiles) and loose task ids from source features. */
export function clusterViewFromFeatures(
  features: readonly GeoJSON.Feature[],
): ClusterView {
  const clusters = new Map<number, TaskCluster>()
  const loose = new Set<string>()
  for (const feature of features) {
    if (feature.geometry.type !== 'Point') continue
    const [lng, lat] = feature.geometry.coordinates
    const props = feature.properties ?? {}
    if (props.cluster) {
      const id = Number(props.cluster_id)
      if (!clusters.has(id)) {
        clusters.set(id, { id, count: Number(props.point_count), lng, lat })
      }
    } else if (typeof props.id === 'string') {
      loose.add(props.id)
    }
  }
  return { clusters: [...clusters.values()], loose }
}

/**
 * A cluster that cannot split any further (same spot, or already at max
 * zoom) opens the list instead of zooming.
 */
export function shouldOpenTaskStack(
  expansionZoom: number,
  currentZoom: number,
  maxZoom: number,
): boolean {
  return expansionZoom > maxZoom || currentZoom >= maxZoom - 0.01
}

export type ClusterSize = 'sm' | 'md' | 'lg'

export function clusterSize(count: number): ClusterSize {
  if (count >= 50) return 'lg'
  if (count >= 10) return 'md'
  return 'sm'
}

const CLUSTER_PX: Record<ClusterSize, number> = { sm: 36, md: 44, lg: 52 }
const CLUSTER_FONT_PX: Record<ClusterSize, number> = { sm: 14, md: 15, lg: 16 }

const CLUSTER_CLASS = 'slashie-map-cluster'
let clusterStylesMounted = false

/**
 * `:active` and `:focus-visible` need a stylesheet. The scale sits on the
 * inner button: Mapbox positions the marker root with `transform`.
 */
function mountClusterStyles() {
  if (clusterStylesMounted || typeof document === 'undefined') return
  clusterStylesMounted = true
  const style = document.createElement('style')
  style.textContent = `
.${CLUSTER_CLASS} { transition: transform ${sdlMotion.duration.fast} ${sdlMotion.easing.standard}; }
.${CLUSTER_CLASS}:active { transform: ${SDL_PRESS_SCALE}; }
.${CLUSTER_CLASS}:focus-visible { outline: 3px solid ${PIN.greenSoft}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .${CLUSTER_CLASS}, .${CLUSTER_CLASS}:active { transition: none; transform: none; }
}`
  document.head.appendChild(style)
}

/** Count bubble for a cluster: brand circle, white ring, no price. */
export function clusterMarkerElement(
  count: number,
  onActivate: () => void,
): HTMLDivElement {
  mountClusterStyles()
  const size = clusterSize(count)
  const px = CLUSTER_PX[size]

  const root = document.createElement('div')
  Object.assign(root.style, { zIndex: PIN_Z_INDEX.task })

  const button = document.createElement('button')
  button.type = 'button'
  button.className = CLUSTER_CLASS
  button.textContent = String(count)
  button.setAttribute('aria-label', `${count} tasks here`)
  Object.assign(button.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${px}px`,
    height: `${px}px`,
    padding: '0',
    borderRadius: '50%',
    border: `3px solid ${PIN.white}`,
    background: PIN.green,
    color: PIN.white,
    boxShadow: PIN.shadowExpanded,
    fontFamily: PIN_FONT,
    fontSize: `${CLUSTER_FONT_PX[size]}px`,
    fontWeight: '800',
    lineHeight: '1',
    cursor: 'pointer',
  })
  button.addEventListener('click', (e) => {
    e.stopPropagation()
    onActivate()
  })

  root.appendChild(button)
  return root
}
