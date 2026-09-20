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
 * Overlay a search→detail handoff onto the last published map layer: solo the
 * targeted pin, freeze browse interactions, and apply detail camera padding.
 */
export function resolveMarketplaceMapLayer(input: {
  published: MarketplaceMapPublishedLayer | null
  focusTaskId: string | null
  viewPadding?: OffsetPadding
  viewport?: MarketplaceMapViewport
}): TaskMapProps | null {
  const { published, focusTaskId, viewPadding } = input
  if (!published) return null

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
