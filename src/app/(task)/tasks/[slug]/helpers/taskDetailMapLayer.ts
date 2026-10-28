/**
 * What the task-detail binder publishes to the shared map, by what the viewer
 * may see (FE-472). Pure, so the privacy rules are tested by what they return:
 * `TaskDetailMapBinder` only gathers the inputs and hands the result to the
 * host.
 */

import type {
  MarketplaceMapPublishedLayer,
  TaskLocationMapAccess,
} from '@/app/(task)/helpers/marketplaceMap'
import type { TaskLocationAccess } from '@/app/(task)/helpers/taskLocationAccess'
import type { OrderItem } from '@/utils/orderHelpers'

import {
  type TaskDetailRecord,
  taskDetailMapCoordinates,
} from './taskDetailUtils'
import { buildTaskDetailMapPinTask } from './taskLocationMap'

type TaskDetailMapInput = {
  task: TaskDetailRecord | null | undefined
  locationAccess: TaskLocationAccess
  myOrder?: OrderItem | null
}

/**
 * Where the map draws this task for this viewer: the circle's centre for
 * everyone but the exact viewers (always `location` as the API returned it),
 * the exact point for them (the booked address when they have it).
 */
export function taskDetailMapCenter(
  input: TaskDetailMapInput,
): { lat: number; lng: number } | null {
  if (!input.task) return null
  return taskDetailMapCoordinates(
    input.task,
    input.myOrder,
    input.locationAccess === 'exact',
  )
}

/** What the host is told about the viewer of this task; null until the task is there. */
export function buildTaskLocationMapAccess(
  input: TaskDetailMapInput & { taskId: string; approxLabel: string },
): TaskLocationMapAccess | null {
  if (!input.task) return null
  return {
    taskId: input.taskId,
    access: input.locationAccess,
    center: taskDetailMapCenter(input),
    approxLabel: input.approxLabel,
  }
}

/**
 * The layer for the host, or null when it should draw none for this viewer:
 * - pending: nothing, the host keeps every pin off until the viewer is known.
 * - approximate: no pin, no route, no You marker, centred on `location`; or,
 *   opened from /search (`keepBrowse`), nothing: the live canvas stays and the
 *   host draws the circle on it.
 * - exact: the task's pin, with the route and the You marker when opened from
 *   /search (`origin`).
 */
export function buildTaskDetailMapLayer(
  input: TaskDetailMapInput & {
    isOwner: boolean
    meId?: string | null
    approxLabel: string
    /** The live Search canvas is kept (opened from /search). */
    keepBrowse: boolean
    /** The Search page's centre from the URL; only an exact viewer's route uses it. */
    origin: { lat: number; lng: number } | null
    accessToken?: string
  },
): MarketplaceMapPublishedLayer | null {
  const { task, locationAccess } = input
  const coords = taskDetailMapCenter(input)
  if (!task || !coords) return null
  if (locationAccess === 'pending') return null

  if (locationAccess === 'approximate') {
    if (input.keepBrowse) return null
    return {
      source: 'detail',
      cameraMode: 'detail',
      variant: 'approximate',
      props: {
        accessToken: input.accessToken,
        centerLat: coords.lat,
        centerLng: coords.lng,
        radiusMiles: 2,
        tasks: [],
        visible: true,
        tasksLoaded: true,
        selectedTaskId: null,
        logoPosition: 'bottom-right',
        showReferenceMarker: false,
        navRouteEnabled: false,
        mapAriaLabel: input.approxLabel,
      },
    }
  }

  const pinTask = buildTaskDetailMapPinTask(
    task,
    coords,
    input.isOwner ? 'owner' : 'visitor',
    input.meId,
    input.origin,
  )

  return {
    source: 'detail',
    cameraMode: 'detail',
    variant: 'exact',
    props: {
      accessToken: input.accessToken,
      centerLat: input.origin?.lat ?? coords.lat,
      centerLng: input.origin?.lng ?? coords.lng,
      radiusMiles: 2,
      tasks: [pinTask],
      visible: true,
      tasksLoaded: true,
      selectedTaskId: task.id,
      logoPosition: 'bottom-right',
      showReferenceMarker: Boolean(input.origin),
      navRouteEnabled: Boolean(input.origin),
      mapAriaLabel: 'Map of this task location',
    },
  }
}
