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

import { HEADER_MIN_HEIGHT } from '@/ui/Header'

import { TaskMap } from '../components/TaskMap'
import {
  type MarketplaceMapPublishedLayer,
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
} from '../helpers/openTaskDetailFromBrowse'

type MarketplaceMapState = {
  published: MarketplaceMapPublishedLayer | null
  focusTaskId: string | null
  overlayAhead: 'search' | null
}

type MarketplaceMapDispatch = {
  publish: (layer: MarketplaceMapPublishedLayer) => void
  prepareDetail: (taskId: string) => void
  prepareBrowse: () => void
  clearFocus: () => void
}

const DispatchContext = createContext<MarketplaceMapDispatch | null>(null)
const StateContext = createContext<MarketplaceMapState>({
  published: null,
  focusTaskId: null,
  overlayAhead: null,
})

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

function PersistentTaskMap() {
  const pathname = usePathname() ?? ''
  const { published, focusTaskId, overlayAhead } = useContext(StateContext)
  const [size, setSize] = useState(() =>
    typeof window === 'undefined'
      ? { w: 0, h: 0 }
      : { w: window.innerWidth, h: window.innerHeight },
  )
  const observerRef = useRef<ResizeObserver | null>(null)

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
  const viewport = marketplaceMapViewport(size.w)
  const inDetail = published?.cameraMode === 'detail' || Boolean(focusTaskId)
  const overlaySurface = overlaySurfaceForSession({
    onSearchPath: isSearchBrowsePath(pathname),
    onDetailPath: isTaskDetailPath(pathname),
    overlayAhead,
  })
  const viewPadding = inDetail
    ? marketplaceMapViewPadding(size.w, size.h, published?.variant ?? 'exact')
    : undefined

  const mapProps = resolveMarketplaceMapLayer({
    published,
    focusTaskId,
    viewPadding,
    viewport,
  })

  if (!show || !mapProps) return null

  return (
    <Box
      ref={onShellRef}
      position="fixed"
      top={HEADER_MIN_HEIGHT}
      right={0}
      bottom={0}
      left={0}
      zIndex={0}
      overflow="hidden"
      pointerEvents="auto"
      aria-hidden={false}
      data-map-source={published?.source}
      data-map-camera={inDetail ? 'detail' : 'browse'}
      data-map-selected={mapProps.selectedTaskId ?? ''}
      data-map-task-count={mapProps.tasks.length}
      data-map-loaded={mapProps.tasksLoaded ? '1' : '0'}
      css={{
        background: 'linear-gradient(135deg, #EEF3F0 0%, #DCE6E0 100%)',
        ...mapFadeOverlayCss(overlaySurface),
        ...overlayWatermarkCss(),
      }}
    >
      <TaskMap
        {...mapProps}
        mobileCtrlBottomOffset={overlayCtrlBottomOffset(viewport, {
          inDetail,
        })}
      />
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
            published: layer,
            focusTaskId: prev.focusTaskId,
            overlayAhead: layer.source === 'browse' ? null : prev.overlayAhead,
          }
        })
      },
      prepareDetail: (taskId) => {
        setState((prev) => ({
          ...prev,
          focusTaskId: taskId,
          overlayAhead: null,
        }))
      },
      prepareBrowse: () => {
        setState((prev) => ({
          ...prev,
          overlayAhead: 'search',
          focusTaskId: null,
        }))
      },
      clearFocus: () => {
        setState((prev) =>
          prev.focusTaskId || prev.overlayAhead
            ? { ...prev, focusTaskId: null, overlayAhead: null }
            : prev,
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
            h="full"
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
