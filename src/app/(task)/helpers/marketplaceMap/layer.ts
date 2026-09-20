import type { TaskMapProps } from '../../components/ui/TaskMap'
import { tasksMarkerSig } from '../taskMap'
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
 */
export function resolveMarketplaceMapLayer(input: {
  published: MarketplaceMapPublishedLayer | null
  focusTaskId: string | null
  viewPadding?: OffsetPadding
  viewport?: MarketplaceMapViewport
}): TaskMapProps | null {
  const { published, focusTaskId, viewPadding } = input
  if (!published) return null

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
    return {
      ...published.props,
      selectedTaskId: focusTaskId,
      cameraMode: 'detail',
      viewPadding,
      taskPinMode: 'all',
      mapInteractions: false,
      leftViewportPadding: 0,
      onSearchThisAreaConfirm: undefined,
      onSelectTask: undefined,
    }
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

  return {
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
    p.leftViewportPadding ?? '',
    p.tasksLoaded ?? true,
    p.visible ?? true,
    p.navRouteEnabled ?? true,
    p.showReferenceMarker ?? true,
    p.logoPosition ?? '',
    tasksMarkerSig(p.tasks),
  ].join('\x1e')
}
