/**
 * The marketplace map host's state and what it draws from it, as pure
 * functions (FE-472). `MarketplaceMapHost` keeps the state with a reducer and
 * renders what `resolveMarketplaceMapHost` returns; both run in unit tests, so
 * the default deny on task detail is tested by what it does, not by its source.
 */

import type { TaskMapProps } from '../../components/ui/TaskMap'
import {
  isTaskDetailPath,
  taskIdFromDetailPath,
} from '../openTaskDetailFromBrowse'
import {
  type MarketplaceMapPublishedLayer,
  type TaskLocationMapAccess,
  confirmedTaskLocationAccess,
  publishedMarketplaceLayerSig,
  resolveMarketplaceMapLayer,
} from './layer'
import {
  APPROX_PILL_ONE_LINE_PX,
  type ApproxFrame,
  approxCircleFrame,
  approxCircleZoom,
} from './offset/approxFrame'
import { marketplaceMapViewPadding } from './offset/offset'
import { type MarketplaceMapViewport, marketplaceMapViewport } from './viewport'

export type MarketplaceMapState = {
  published: MarketplaceMapPublishedLayer | null
  focusTaskId: string | null
  overlayAhead: 'search' | null
  /**
   * What the task-detail binder confirmed about the viewer of one task
   * (FE-472). Until it says `exact` for the framed task, the map draws no pin,
   * route or You marker for it.
   */
  taskAccess: TaskLocationMapAccess | null
  /** The compact approximate pill's measured height; null until it is on screen. */
  approxPillH: number | null
}

export const INITIAL_MARKETPLACE_MAP_STATE: MarketplaceMapState = {
  published: null,
  focusTaskId: null,
  overlayAhead: null,
  taskAccess: null,
  approxPillH: null,
}

export type MarketplaceMapAction =
  | { type: 'publish'; layer: MarketplaceMapPublishedLayer }
  | { type: 'prepareDetail'; taskId: string }
  | { type: 'prepareBrowse' }
  | { type: 'clearFocus' }
  | { type: 'setTaskAccess'; access: TaskLocationMapAccess | null }
  | { type: 'setApproxPillHeight'; height: number | null }

export function sameTaskAccess(
  a: TaskLocationMapAccess | null,
  b: TaskLocationMapAccess | null,
): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.taskId === b.taskId &&
    a.access === b.access &&
    a.approxLabel === b.approxLabel &&
    a.center?.lat === b.center?.lat &&
    a.center?.lng === b.center?.lng
  )
}

/**
 * The host's transitions. Returns the same object for a change that changes
 * nothing, so React skips the render.
 */
export function marketplaceMapReducer(
  prev: MarketplaceMapState,
  action: MarketplaceMapAction,
): MarketplaceMapState {
  switch (action.type) {
    case 'publish': {
      if (
        prev.published &&
        publishedMarketplaceLayerSig(prev.published) ===
          publishedMarketplaceLayerSig(action.layer)
      ) {
        return prev
      }
      return {
        ...prev,
        published: action.layer,
        overlayAhead:
          action.layer.source === 'browse' ? null : prev.overlayAhead,
      }
    }
    case 'prepareDetail':
      return {
        ...prev,
        focusTaskId: action.taskId,
        overlayAhead: null,
        // A confirmation for another task never unlocks this one.
        taskAccess:
          prev.taskAccess?.taskId === action.taskId ? prev.taskAccess : null,
      }
    case 'prepareBrowse':
      return {
        ...prev,
        overlayAhead: 'search',
        focusTaskId: null,
        taskAccess: null,
      }
    case 'clearFocus':
      return prev.focusTaskId || prev.overlayAhead || prev.taskAccess
        ? { ...prev, focusTaskId: null, overlayAhead: null, taskAccess: null }
        : prev
    case 'setTaskAccess':
      return sameTaskAccess(prev.taskAccess, action.access)
        ? prev
        : { ...prev, taskAccess: action.access }
    case 'setApproxPillHeight':
      return prev.approxPillH === action.height
        ? prev
        : { ...prev, approxPillH: action.height }
  }
}

/**
 * The task the map frames. On a task page that is the page's own task, always:
 * a focus left by an earlier Search handoff (Search, a task, My tasks, another
 * task) never wins there, or the page's pin and circle would be filtered out
 * for a task it is not showing. Elsewhere the focus is the handoff in flight.
 */
export function framingTaskIdFor(input: {
  pathname: string
  focusTaskId: string | null
}): string | null {
  return taskIdFromDetailPath(input.pathname) ?? input.focusTaskId
}

export type MarketplaceMapHostView = {
  onDetailPath: boolean
  framingTaskId: string | null
  viewport: MarketplaceMapViewport
  /** The binder's confirmation for the framed task, on the detail path only. */
  confirmedAccess: TaskLocationMapAccess | null
  /** The circle's window and pill box for an approximate viewer; null otherwise. */
  approxFrame: ApproxFrame | null
  /** What the map draws; null when nothing is published. */
  mapProps: TaskMapProps | null
}

/** Everything `PersistentTaskMap` draws, from the state, the path and its size. */
export function resolveMarketplaceMapHost(input: {
  state: MarketplaceMapState
  pathname: string
  size: { w: number; h: number }
  /** Where the page starts, measured by the host; the frame's default until then. */
  topInset?: number | null
}): MarketplaceMapHostView {
  const { state, pathname, size } = input
  const { published, focusTaskId, taskAccess, approxPillH } = state
  const topInset = input.topInset ?? undefined

  const onDetailPath = isTaskDetailPath(pathname)
  const framingTaskId = framingTaskIdFor({ pathname, focusTaskId })
  const viewport = marketplaceMapViewport(size.w)
  const publishedDetail = published?.cameraMode === 'detail'
  // Who the binder confirmed for the framed task. Default deny: anything but
  // `exact` draws no pin; `approximate` draws the circle and its pill.
  const confirmedAccess = confirmedTaskLocationAccess({
    onDetailPath,
    framingTaskId,
    locationAccess: taskAccess,
  })
  const approximate = confirmedAccess?.access === 'approximate'
  const pillHeight = approxPillH ?? APPROX_PILL_ONE_LINE_PX
  const viewPadding =
    publishedDetail || Boolean(framingTaskId)
      ? marketplaceMapViewPadding(
          size.w,
          size.h,
          approximate ? 'approximate' : (published?.variant ?? 'exact'),
          pillHeight,
          topInset,
        )
      : undefined
  const approxFrame =
    approximate && size.w > 0 && size.h > 0
      ? approxCircleFrame({
          viewport,
          width: size.w,
          height: size.h,
          pillHeight,
          topInset,
        })
      : null
  const approxZoom =
    approxFrame && confirmedAccess?.center
      ? approxCircleZoom(confirmedAccess.center.lat, approxFrame.diameterPx)
      : undefined

  const resolved = resolveMarketplaceMapLayer({
    published,
    focusTaskId: framingTaskId,
    viewPadding,
    viewport,
    onDetailPath,
    locationAccess: taskAccess,
    approxZoom,
  })
  const mapProps =
    resolved && onDetailPath && published?.source === 'browse'
      ? {
          ...resolved,
          mapInteractions: false,
          onSelectTask: undefined,
          onSearchThisAreaConfirm: undefined,
        }
      : resolved

  return {
    onDetailPath,
    framingTaskId,
    viewport,
    confirmedAccess,
    approxFrame,
    mapProps,
  }
}
