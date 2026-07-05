import { BRAND_MAP_PIN } from '@/theme/brand'
import type { TaskMapTask } from '../types'
import { pinMilesText, pinPriceText, taskPinContentSig } from './content'
import { type TaskMapPinHandle, taskMarkerElement } from './marker'
import { PIN, PIN_FONT } from './styles'

export type { TaskMapPinHandle }

export { pinMilesText, pinPriceText, taskPinContentSig }

/** GraphQL / JSON often returns coordinates as strings; Mapbox needs finite numbers. */
export function parseCoord(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function taskLngLat(
  task: TaskMapTask,
): { lng: number; lat: number } | null {
  const lat = parseCoord(task.locationLat)
  const lng = parseCoord(task.locationLng)
  if (lat == null || lng == null) return null
  return { lat, lng }
}

export function tasksCoordsSig(tasks: TaskMapTask[]): string {
  return tasks
    .map((t) => {
      const ll = taskLngLat(t)
      return ll ? `${t.id}:${ll.lat},${ll.lng}` : ''
    })
    .filter(Boolean)
    .join('|')
}

export function tasksMarkerSig(tasks: TaskMapTask[]): string {
  return tasks
    .map((t) => {
      const ll = taskLngLat(t)
      if (!ll) return ''
      return `${t.id}:${ll.lat},${ll.lng}:${taskPinContentSig(t)}`
    })
    .filter(Boolean)
    .join('|')
}

/**
 * Viewer's search-reference / current-location marker: brand dot with a "You"
 * pill floating above it. The pill is absolutely positioned so the root's
 * layout box stays the 18px dot — the Mapbox `center` anchor keeps the dot
 * exactly on the coordinate.
 */
export function referenceMarkerElement(): HTMLDivElement {
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  Object.assign(root.style, {
    position: 'relative',
    width: '18px',
    height: '18px',
    zIndex: '0',
    pointerEvents: 'none',
  })

  const dot = document.createElement('div')
  Object.assign(dot.style, {
    position: 'absolute',
    inset: '0',
    borderRadius: '50%',
    background: BRAND_MAP_PIN,
    border: '3px solid #ffffff',
    boxShadow: '0 0 0 2px rgba(0,220,130,0.35), 0 2px 8px rgba(15,23,42,0.25)',
  })

  // Same pill chrome as the task price pill, inverted: green fill, white text.
  const pill = document.createElement('div')
  pill.textContent = 'You'
  Object.assign(pill.style, {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px 10px',
    borderRadius: '999px',
    background: PIN.green,
    color: PIN.white,
    fontFamily: PIN_FONT,
    fontSize: '12px',
    fontWeight: '800',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    boxShadow: PIN.shadow,
  })

  root.append(dot, pill)
  return root
}

/**
 * Standalone task-location dot matching the browse map's selected task pin
 * (brand-green dot, white ring, soft glow). Non-interactive — use as a Mapbox
 * `Marker` element with center anchor for single-location maps (e.g. task detail).
 */
export function taskPinDotElement(): HTMLDivElement {
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  Object.assign(root.style, {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: PIN.greenBright,
    border: '2.5px solid #ffffff',
    boxShadow: `0 0 0 3px ${PIN.greenPale}, ${PIN.shadow}`,
    pointerEvents: 'none',
  })
  return root
}

export { taskMarkerElement }
