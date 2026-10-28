import type { TaskMapProps } from '../../components/ui/TaskMap'
import type { TaskLocationAccess } from '../taskLocationAccess'
import { tasksMarkerSig } from '../taskMap'
import { TASK_ZONE_RADIUS_M } from '../taskMap/zoneCircle'
import type { OffsetMapVariant, OffsetPadding } from './offset/config'
import { pinsPathForViewport } from './pinsPath/pinsPath'
import type { MarketplaceMapViewport } from './viewport'

export type MarketplaceMapCameraMode = 'browse' | 'detail'

export type MarketplaceMapPublishedLayer = {
  source: 'browse' | 'detail'
  cameraMode: MarketplaceMapCameraMode
  variant: OffsetMapVariant
  props: TaskMapProps
}

/**
 * What the task-detail binder tells the host about the viewer of one task
 * (FE-472). The host draws a task's pin, route and You marker only once this
 * says `exact` for that task, and draws the circle when it says `approximate`.
 */
export type TaskLocationMapAccess = {
  taskId: string
  access: TaskLocationAccess
  /** The task's `location` as the API returned it: the circle's centre. Null until known. */
  center: { lat: number; lng: number } | null
  /** The approximate pill's copy, also the map's accessible label for approximate viewers. */
  approxLabel: string
}

/**
 * The binder's confirmation for the task the detail path frames, or null: on
 * the detail path only, and only for that same task (a leftover confirmation
 * for another task never unlocks this one).
 */
export function confirmedTaskLocationAccess(input: {
  onDetailPath?: boolean
  framingTaskId: string | null
  locationAccess?: TaskLocationMapAccess | null
}): TaskLocationMapAccess | null {
  if (!input.onDetailPath || !input.framingTaskId) return null
  return input.locationAccess?.taskId === input.framingTaskId
    ? input.locationAccess
    : null
}

/**
 * Keep a live `/search` canvas intact (every pin + camera). Only a published
 * detail layer (cold task-detail load) may solo/reframe.
 */
export function shouldKeepBrowseMarketplaceMap(input: {
  published: MarketplaceMapPublishedLayer | null
  taskId?: string | null
  focusTaskId?: string | null
  fromSearch: boolean
}): boolean {
  if (input.published?.source !== 'browse') return false
  if (input.fromSearch) return true
  return Boolean(input.taskId && input.focusTaskId === input.taskId)
}

/**
 * Overlay a search→detail handoff onto the last published map layer.
 * Browse layers keep every pin; `focusTaskId` only reframes the camera
 * (detail padding / top-right on web) so Mapbox is not rebuilt.
 *
 * Default deny (FE-472): on the task-detail path a task's pin, the other
 * browse pins, the driving route and the You marker are drawn only once the
 * binder confirmed `exact` for that task (`locationAccess`). Anything else,
 * including "not known yet" and a leftover confirmation for another task, draws
 * none of them, and `approximate` draws the circle instead. `/search` itself
 * (`onDetailPath` false) is untouched.
 */
export function resolveMarketplaceMapLayer(input: {
  published: MarketplaceMapPublishedLayer | null
  focusTaskId: string | null
  viewPadding?: OffsetPadding
  viewport?: MarketplaceMapViewport
  /** On `/tasks/[slug]` or its preview: not merely a leftover focus on `/search`. */
  onDetailPath?: boolean
  locationAccess?: TaskLocationMapAccess | null
  /** The zoom that fits the circle in its window (the host measures the window). */
  approxZoom?: number
}): TaskMapProps | null {
  const { published, focusTaskId, viewPadding } = input
  if (!published) return null

  const detailTaskId = input.onDetailPath ? focusTaskId : null
  const confirmed = confirmedTaskLocationAccess({
    onDetailPath: input.onDetailPath,
    framingTaskId: focusTaskId,
    locationAccess: input.locationAccess,
  })
  // A browse layer holds the public point's pin, so it never counts as the
  // exact one: an exact viewer gets the binder's own detail layer.
  const denyPins =
    detailTaskId != null &&
    (published.source === 'browse' || confirmed?.access !== 'exact')

  const hidePins = (props: TaskMapProps): TaskMapProps => ({
    ...props,
    tasks: [],
    selectedTaskId: null,
    taskPinMode: 'none',
    navRouteEnabled: false,
    showReferenceMarker: false,
    mapInteractions: false,
    approxZone:
      confirmed?.access === 'approximate' &&
      confirmed.center &&
      input.approxZoom != null
        ? {
            taskId: confirmed.taskId,
            lat: confirmed.center.lat,
            lng: confirmed.center.lng,
            radiusM: TASK_ZONE_RADIUS_M,
            zoom: input.approxZoom,
          }
        : null,
    mapAriaLabel:
      confirmed?.access === 'approximate'
        ? confirmed.approxLabel
        : props.mapAriaLabel,
  })

  if (published.source === 'browse') {
    if (!focusTaskId) {
      return {
        ...published.props,
        cameraMode: 'browse',
        viewPadding: undefined,
        taskPinMode: 'all',
        mapInteractions: published.props.mapInteractions ?? true,
      }
    }
    const props: TaskMapProps = {
      ...published.props,
      selectedTaskId: focusTaskId,
      cameraMode: 'detail',
      viewPadding,
      taskPinMode: 'all',
      mapInteractions: false,
      leftViewportPadding: 0,
      // Task detail has no search logo or bar over the map: controls go back
      // to the top instead of keeping search's space for them.
      compactCtrlTopOffset: undefined,
      touchCtrlTopOffset: undefined,
      onSearchThisAreaConfirm: undefined,
      onSelectTask: undefined,
    }
    return denyPins ? hidePins(props) : props
  }

  const inDetail = published.cameraMode === 'detail' || Boolean(focusTaskId)
  const selectedTaskId = focusTaskId ?? published.props.selectedTaskId ?? null
  const tasks = focusTaskId
    ? published.props.tasks.filter((task) => task.id === focusTaskId)
    : published.props.tasks
  const path = pinsPathForViewport(input.viewport ?? 'mobile', {
    inDetail,
    variant: published.variant,
  })

  const props: TaskMapProps = {
    ...published.props,
    tasks,
    selectedTaskId,
    cameraMode: inDetail ? 'detail' : 'browse',
    viewPadding: inDetail ? viewPadding : undefined,
    taskPinMode: path.taskPinMode,
    mapInteractions: !inDetail,
    leftViewportPadding: inDetail ? 0 : published.props.leftViewportPadding,
    onSearchThisAreaConfirm: inDetail
      ? undefined
      : published.props.onSearchThisAreaConfirm,
    onSelectTask: inDetail ? undefined : published.props.onSelectTask,
  }
  return denyPins ? hidePins(props) : props
}

export function publishedMarketplaceLayerSig(
  layer: MarketplaceMapPublishedLayer,
): string {
  const p = layer.props
  return [
    layer.source,
    layer.cameraMode,
    layer.variant,
    p.centerLat,
    p.centerLng,
    p.radiusMiles,
    p.selectedTaskId ?? '',
    p.selectedTaskSelectionToken ?? 0,
    p.recenterToken ?? 0,
    p.leftViewportPadding ?? '',
    p.tasksLoaded ?? true,
    p.visible ?? true,
    p.navRouteEnabled ?? true,
    p.showReferenceMarker ?? true,
    p.logoPosition ?? '',
    tasksMarkerSig(p.tasks),
  ].join('\x1e')
}
