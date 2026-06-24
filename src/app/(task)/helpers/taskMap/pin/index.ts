import { BRAND_MAP_PIN } from '@/theme/brand'
import type { TaskMapTask } from '../types'
import { pinMilesText, pinPriceText, taskPinContentSig } from './content'
import { type TaskMapPinHandle, taskMarkerElement } from './marker'

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

export function referenceMarkerElement(): HTMLDivElement {
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  Object.assign(root.style, {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: BRAND_MAP_PIN,
    border: '3px solid #ffffff',
    boxShadow: '0 0 0 2px rgba(0,220,130,0.35), 0 2px 8px rgba(15,23,42,0.25)',
    zIndex: '0',
    pointerEvents: 'none',
  })
  return root
}

export { taskMarkerElement }
