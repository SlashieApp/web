import type { TaskMapTask } from '@/app/(task)/helpers/taskMap/types'
import {
  distanceMilesBetween,
  formatDistanceAwayLabel,
} from '@/utils/geoDistance'
import {
  type TaskBudgetViewerContext,
  type TaskDetailRecord,
  taskBudgetDisplayLine,
} from './taskDetailUtils'

/** Browse-style expanded price pin payload for the task-detail map. */
export function buildTaskDetailMapPinTask(
  task: TaskDetailRecord,
  coords: { lat: number; lng: number },
  viewer: TaskBudgetViewerContext,
  viewerUserId?: string | null,
  origin?: { lat: number; lng: number } | null,
): TaskMapTask {
  const priceLabel = taskBudgetDisplayLine(task, viewer, viewerUserId)
  const distanceLabel = origin
    ? formatDistanceAwayLabel(
        distanceMilesBetween(origin.lat, origin.lng, coords.lat, coords.lng),
      )
    : undefined
  return {
    id: task.id,
    title: task.title,
    locationLat: coords.lat,
    locationLng: coords.lng,
    priceLabel,
    detailLine: priceLabel,
    distanceLabel,
  }
}

export type TaskDetailMapOrigin = { lat: number; lng: number }

/**
 * Driving-route origin for task detail: only when the visitor arrived from
 * `/search` with that page's browse center in the query string.
 */
export function parseTaskDetailSearchRouteOrigin(input: {
  from?: string | null
  lat?: string | null
  lng?: string | null
}): TaskDetailMapOrigin | null {
  if (input.from !== 'search') return null
  const lat = Number.parseFloat(input.lat ?? '')
  const lng = Number.parseFloat(input.lng ?? '')
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null
  }
  return { lat, lng }
}

export function taskDetailSearchRouteOriginFromLocationSearch(
  search: string,
): TaskDetailMapOrigin | null {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  return parseTaskDetailSearchRouteOrigin({
    from: params.get('from'),
    lat: params.get('lat'),
    lng: params.get('lng'),
  })
}
