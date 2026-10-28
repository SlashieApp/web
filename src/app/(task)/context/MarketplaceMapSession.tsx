'use client'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { HEADER_BAR_H } from '@/ui/StickyHeader'

import { ApproximateAreaPill } from '../components/ui/ApproximateAreaPill'
import { TaskMap, type TaskMapProps } from '../components/ui/TaskMap'
import {
  APPROX_PILL_ONE_LINE_PX,
  type MarketplaceMapPublishedLayer,
  type TaskLocationMapAccess,
  approxCircleFrame,
  approxCircleZoom,
  confirmedTaskLocationAccess,
  mapFadeOverlayCss,
  marketplaceMapViewPadding,
  marketplaceMapViewport,
  overlayCtrlBottomOffset,
  overlaySurfaceForSession,
  overlayWatermarkCss,
  publishedMarketplaceLayerSig,
  resolveMarketplaceMapLayer,
} from '../helpers/marketplaceMap'
import {
  isPersistentMarketplaceMapPath,
  isSearchBrowsePath,
  isTaskDetailPath,
  taskIdFromDetailPath,
} from '../helpers/openTaskDetailFromBrowse'

type MarketplaceMapState = {
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

type MarketplaceMapDispatch = {
  publish: (layer: MarketplaceMapPublishedLayer) => void
  prepareDetail: (taskId: string) => void
  prepareBrowse: () => void
  clearFocus: () => void
  setTaskAccess: (access: TaskLocationMapAccess | null) => void
  setApproxPillHeight: (height: number | null) => void
}

const DispatchContext = createContext<MarketplaceMapDispatch | null>(null)
const StateContext = createContext<MarketplaceMapState>({
  published: null,
  focusTaskId: null,
  overlayAhead: null,
  taskAccess: null,
  approxPillH: null,
})

function sameTaskAccess(
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

function MarketplaceMapStateProvider({
  children,
  value,
}: {
  children: ReactNode
  value: MarketplaceMapState
}) {
  return <StateContext.Provider value={value}>{children}</StateContext.Provider>
}

export function useMarketplaceMapDispatch(): MarketplaceMapDispatch | null {
  return useContext(DispatchContext)
}

export function useMarketplaceMapState(): MarketplaceMapState {
  return useContext(StateContext)
}

/**
 * Push this route's map bindings into the layout-level Mapbox host. Browse
 * remounts clear a leftover detail focus so Back restores every pin.
 */
export function usePublishMarketplaceMap(
  layer: MarketplaceMapPublishedLayer | null,
  options?: { resetFocusOnMount?: boolean },
) {
  const dispatch = useMarketplaceMapDispatch()
  const resetFocusOnMount = options?.resetFocusOnMount ?? false

  useLayoutEffect(() => {
    if (!resetFocusOnMount) return
    dispatch?.clearFocus()
  }, [dispatch, resetFocusOnMount])

  useLayoutEffect(() => {
    if (!layer) return
    dispatch?.publish(layer)
  }, [dispatch, layer])
}

/**
 * Tell the host who is looking at this task (FE-472). Published with the
 * layer, so the host never draws a pin, route or You marker for the task
 * before the viewer is known. Cleared when the page goes.
 */
export function usePublishTaskLocationAccess(
  access: TaskLocationMapAccess | null,
) {
  const dispatch = useMarketplaceMapDispatch()
  useLayoutEffect(() => {
    dispatch?.setTaskAccess(access)
  }, [dispatch, access])
  useLayoutEffect(() => () => dispatch?.setTaskAccess(null), [dispatch])
}

/**
 * A callback ref for the compact approximate pill: reports its height, which
 * moves the circle's window (the pill is one line or two). Reports null when
 * the pill goes or is hidden.
 */
export function useApproxPillHeightRef() {
  const dispatch = useMarketplaceMapDispatch()
  const cleanupRef = useRef<(() => void) | null>(null)
  return useCallback(
    (node: HTMLElement | null) => {
      cleanupRef.current?.()
      cleanupRef.current = null
      if (!node || !dispatch) return
      const report = () => {
        const height = Math.round(node.offsetHeight)
        dispatch.setApproxPillHeight(height > 0 ? height : null)
      }
      report()
      if (typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(report)
      observer.observe(node)
      cleanupRef.current = () => {
        observer.disconnect()
        dispatch.setApproxPillHeight(null)
      }
    },
    [dispatch],
  )
}

function PersistentTaskMap() {
  const pathname = usePathname() ?? ''
  const { published, focusTaskId, overlayAhead, taskAccess, approxPillH } =
    useContext(StateContext)
  const [size, setSize] = useState(() =>
    typeof window === 'undefined'
      ? { w: 0, h: 0 }
      : { w: window.innerWidth, h: window.innerHeight },
  )
  const observerRef = useRef<ResizeObserver | null>(null)
  const heldPropsRef = useRef<TaskMapProps | null>(null)

  const onShellRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return
    const apply = () => setSize({ w: node.offsetWidth, h: node.offsetHeight })
    apply()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    observerRef.current = observer
  }, [])

  const show = isPersistentMarketplaceMapPath(pathname)
  const onDetailPath = isTaskDetailPath(pathname)
  const framingTaskId = focusTaskId ?? taskIdFromDetailPath(pathname)
  const viewport = marketplaceMapViewport(size.w)
  const publishedDetail = published?.cameraMode === 'detail'
  const overlaySurface = overlaySurfaceForSession({
    onSearchPath: isSearchBrowsePath(pathname),
    onDetailPath,
    overlayAhead,
  })
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
        )
      : undefined
  const approxFrame =
    approximate && size.w > 0 && size.h > 0
      ? approxCircleFrame({
          viewport,
          width: size.w,
          height: size.h,
          pillHeight,
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

  if (mapProps) heldPropsRef.current = mapProps
  const liveProps = mapProps ?? heldPropsRef.current

  if (!show || !liveProps) return null

  return (
    <Box
      ref={onShellRef}
      position="fixed"
      top={0}
      right={0}
      bottom={0}
      left={0}
      zIndex={0}
      overflow="hidden"
      pointerEvents="auto"
      aria-hidden={false}
      data-map-source={published?.source}
      data-map-camera={liveProps.cameraMode ?? 'browse'}
      data-map-selected={liveProps.selectedTaskId ?? ''}
      data-map-task-count={liveProps.tasks.length}
      data-map-loaded={liveProps.tasksLoaded ? '1' : '0'}
      data-map-zone={liveProps.approxZone ? '1' : '0'}
      css={{
        // A neutral placeholder while the map loads: bg.subtle into border.default.
        background:
          'linear-gradient(135deg, var(--chakra-colors-bg-subtle) 0%, var(--chakra-colors-border-default) 100%)',
        ...mapFadeOverlayCss(overlaySurface),
        ...overlayWatermarkCss(),
      }}
    >
      <TaskMap
        {...liveProps}
        mobileCtrlBottomOffset={overlayCtrlBottomOffset(viewport, {
          inDetail: onDetailPath || publishedDetail,
        })}
        // Task detail's page header floats over the map's top: the zoom and
        // compass controls start below it.
        ctrlTopClearance={onDetailPath ? `${HEADER_BAR_H}px` : undefined}
      />
      {/* From lg the pill sits in the right half, above the circle, in this
          fixed layer (the left-side wash does not reach it). Below lg it rides
          with the page content (TaskDetailMapPill). It lets every gesture
          through. */}
      {viewport === 'web' &&
      approxFrame &&
      confirmedAccess?.center &&
      liveProps.approxZone ? (
        <Box
          position="absolute"
          zIndex={1}
          top={`${approxFrame.pill.top}px`}
          left={`${approxFrame.centerX}px`}
          transform="translateX(-50%)"
          w="max-content"
          maxW="calc(50% - 4rem)"
          pointerEvents="none"
        >
          <ApproximateAreaPill label={confirmedAccess.approxLabel} />
        </Box>
      ) : null}
    </Box>
  )
}

/**
 * Owns the one Mapbox instance shared by `/search` and `/tasks/[slug]`.
 * Binders on those routes publish props; the canvas stays mounted across
 * the page transition so pins/camera can animate instead of remounting.
 */
export function MarketplaceMapHost({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const overMap = isPersistentMarketplaceMapPath(pathname)
  const [state, setState] = useState<MarketplaceMapState>({
    published: null,
    focusTaskId: null,
    overlayAhead: null,
    taskAccess: null,
    approxPillH: null,
  })

  const dispatch = useMemo<MarketplaceMapDispatch>(
    () => ({
      publish: (layer) => {
        setState((prev) => {
          if (
            prev.published &&
            publishedMarketplaceLayerSig(prev.published) ===
              publishedMarketplaceLayerSig(layer)
          ) {
            return prev
          }
          return {
            ...prev,
            published: layer,
            overlayAhead: layer.source === 'browse' ? null : prev.overlayAhead,
          }
        })
      },
      prepareDetail: (taskId) => {
        setState((prev) => ({
          ...prev,
          focusTaskId: taskId,
          overlayAhead: null,
          // A confirmation for another task never unlocks this one.
          taskAccess:
            prev.taskAccess?.taskId === taskId ? prev.taskAccess : null,
        }))
      },
      prepareBrowse: () => {
        setState((prev) => ({
          ...prev,
          overlayAhead: 'search',
          focusTaskId: null,
          taskAccess: null,
        }))
      },
      clearFocus: () => {
        setState((prev) =>
          prev.focusTaskId || prev.overlayAhead || prev.taskAccess
            ? {
                ...prev,
                focusTaskId: null,
                overlayAhead: null,
                taskAccess: null,
              }
            : prev,
        )
      },
      setTaskAccess: (access) => {
        setState((prev) =>
          sameTaskAccess(prev.taskAccess, access)
            ? prev
            : { ...prev, taskAccess: access },
        )
      },
      setApproxPillHeight: (height) => {
        setState((prev) =>
          prev.approxPillH === height ? prev : { ...prev, approxPillH: height },
        )
      },
    }),
    [],
  )

  return (
    <DispatchContext.Provider value={dispatch}>
      <MarketplaceMapStateProvider value={state}>
        <Box h="full" minH="100%">
          <PersistentTaskMap />
          <Box
            position="relative"
            zIndex={1}
            h={overMap ? 'full' : 'auto'}
            minH="100%"
            pointerEvents={overMap ? 'none' : 'auto'}
          >
            {children}
          </Box>
        </Box>
      </MarketplaceMapStateProvider>
    </DispatchContext.Provider>
  )
}
