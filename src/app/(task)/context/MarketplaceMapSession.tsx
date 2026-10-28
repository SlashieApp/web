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
  useReducer,
  useRef,
  useState,
} from 'react'

import { HEADER_BAR_H } from '@/ui/StickyHeader'

import { ApproximateAreaPill } from '../components/ui/ApproximateAreaPill'
import { TaskMap, type TaskMapProps } from '../components/ui/TaskMap'
import {
  INITIAL_MARKETPLACE_MAP_STATE,
  type MarketplaceMapPublishedLayer,
  type MarketplaceMapState,
  type TaskLocationMapAccess,
  mapFadeOverlayCss,
  marketplaceMapReducer,
  overlayCtrlBottomOffset,
  overlaySurfaceForSession,
  overlayWatermarkCss,
  resolveMarketplaceMapHost,
} from '../helpers/marketplaceMap'
import {
  isPersistentMarketplaceMapPath,
  isSearchBrowsePath,
} from '../helpers/openTaskDetailFromBrowse'

type MarketplaceMapDispatch = {
  publish: (layer: MarketplaceMapPublishedLayer) => void
  prepareDetail: (taskId: string) => void
  prepareBrowse: () => void
  clearFocus: () => void
  setTaskAccess: (access: TaskLocationMapAccess | null) => void
  setApproxPillHeight: (height: number | null) => void
}

const DispatchContext = createContext<MarketplaceMapDispatch | null>(null)
const StateContext = createContext<MarketplaceMapState>(
  INITIAL_MARKETPLACE_MAP_STATE,
)

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

/**
 * How long a measured change in where the page starts must hold before the
 * circle's window follows it. The header slot slides away and back as the
 * page scrolls, and its banners come and go: the camera follows the settled
 * value, not every frame of that motion.
 */
const TOP_INSET_SETTLE_MS = 200

function PersistentTaskMap() {
  const pathname = usePathname() ?? ''
  const state = useContext(StateContext)
  const { published, overlayAhead } = state
  const [size, setSize] = useState(() =>
    typeof window === 'undefined'
      ? { w: 0, h: 0 }
      : { w: window.innerWidth, h: window.innerHeight },
  )
  // Where the page starts, from the top of the viewport (FE-472): the app's
  // status banners (and from lg the header) sit above `main`, and the map is
  // fixed under them. Null until measured; the frame's defaults cover that.
  const [topInset, setTopInset] = useState<number | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const insetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heldPropsRef = useRef<TaskMapProps | null>(null)

  const onShellRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (insetTimerRef.current) clearTimeout(insetTimerRef.current)
    insetTimerRef.current = null
    if (!node) return
    const scroller = node.closest('main')
    const apply = () => {
      setSize({ w: node.offsetWidth, h: node.offsetHeight })
      // Only at rest: scrolled down, the compact header slot is tucked away
      // and the page's resting top is not what is on screen.
      if (!scroller || scroller.scrollTop > 1) return
      const next = Math.round(scroller.getBoundingClientRect().top)
      if (insetTimerRef.current) clearTimeout(insetTimerRef.current)
      insetTimerRef.current = setTimeout(() => {
        insetTimerRef.current = null
        setTopInset(next)
      }, TOP_INSET_SETTLE_MS)
      // The first measure applies at once, so the first camera is right.
      setTopInset((prev) => (prev == null ? next : prev))
    }
    apply()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    if (scroller) observer.observe(scroller)
    observerRef.current = observer
  }, [])

  const show = isPersistentMarketplaceMapPath(pathname)
  const { onDetailPath, viewport, confirmedAccess, approxFrame, mapProps } =
    resolveMarketplaceMapHost({ state, pathname, size, topInset })
  const overlaySurface = overlaySurfaceForSession({
    onSearchPath: isSearchBrowsePath(pathname),
    onDetailPath,
    overlayAhead,
  })
  const publishedDetail = published?.cameraMode === 'detail'

  if (mapProps) heldPropsRef.current = mapProps
  const liveProps = mapProps ?? heldPropsRef.current

  if (!show || !liveProps) return null

  // On a task page with no pins to draw (an approximate viewer, or one not
  // known yet) the markers a Search canvas left on screen go in this same
  // commit; the controller removes them a frame later.
  const hideStaleMarkers = onDetailPath && liveProps.taskPinMode === 'none'

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
        ...(hideStaleMarkers
          ? { '& .mapboxgl-marker': { display: 'none' } }
          : {}),
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
  const [state, send] = useReducer(
    marketplaceMapReducer,
    INITIAL_MARKETPLACE_MAP_STATE,
  )

  const dispatch = useMemo<MarketplaceMapDispatch>(
    () => ({
      publish: (layer) => send({ type: 'publish', layer }),
      prepareDetail: (taskId) => send({ type: 'prepareDetail', taskId }),
      prepareBrowse: () => send({ type: 'prepareBrowse' }),
      clearFocus: () => send({ type: 'clearFocus' }),
      setTaskAccess: (access) => send({ type: 'setTaskAccess', access }),
      setApproxPillHeight: (height) =>
        send({ type: 'setApproxPillHeight', height }),
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
