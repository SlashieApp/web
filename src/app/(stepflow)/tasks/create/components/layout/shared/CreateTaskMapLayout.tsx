'use client'

import {
  Box,
  Grid,
  Stack,
  type SystemStyleObject,
  Text,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react'

import { marketplaceMapMotion } from '@/app/(task)/helpers/marketplaceMap/motion'
import { TASK_DETAIL_DESKTOP_MAP_SPACER } from '@/app/(task)/tasks/[slug]/helpers/taskDetailLayout'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { SHEET_SLOP_PX, velocityFromSamples } from '@/ui/Drawer/sheetMotion'
import {
  StepFlowActions,
  type StepFlowActionsProps,
  StepFlowHeading,
} from '@ui'
import {
  type LocationPanelState,
  resolveLocationPanelSnap,
} from '../../../helpers/locationPanel'
import bag from '../../../i11n.json'

/**
 * The map band above the form on later steps. Short on phones and tablets
 * (FE-295) so the first field sits above the fold; desktop matches task detail.
 */
const MAP_BAND_H = {
  base: '160px',
  md: '220px',
  lg: TASK_DETAIL_DESKTOP_MAP_SPACER,
} as const

/** The bottom card's rounded top sits over the map by this much. */
const CARD_MAP_OVERLAP_PX = 16

/** Desktop floating location card (matches the `/search` list column feel). */
const DESKTOP_LOCATION_CARD_W = '420px'

/**
 * The phone card stops at this share of the map area (below the header and
 * progress strip), so a strip of map and the pin show above the open panel.
 */
const PANEL_MAX_SHARE = 0.75

/** A drag's release also clicks the handle; that click must not toggle. */
const CLICK_AFTER_DRAG_MS = 400

/** One drag of the panel handle, from pointer down to up. */
type PanelDrag = {
  pointerId: number
  startY: number
  /** Panel body height (px) when the finger landed. */
  startH: number
  /** Past the slop: the panel follows the finger. */
  dragging: boolean
  height: number
  samples: { t: number; offset: number }[]
}

/** Card/panel rises in on stage change. Reduced motion: crossfade only. */
const stageEnterCss = {
  opacity: 1,
  transform: 'translateY(0)',
  transitionProperty: 'opacity, transform',
  transitionDuration: sdlMotion.duration.slow,
  transitionTimingFunction: sdlMotion.easing.standard,
  transitionDelay: sdlMotion.duration.moderate,
  '@starting-style': {
    opacity: 0,
    transform: 'translateY(1.25rem)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'opacity',
    transitionDelay: '0ms',
    transform: 'none',
    '@starting-style': { opacity: 0, transform: 'none' },
  },
} as SystemStyleObject

/**
 * Phones and tablets, location step (FE-349): the bottom card is a panel
 * that starts compact and pulls up to the full address form.
 */
export type CreateTaskLocationPanel = {
  state: LocationPanelState
  onStateChange: (next: LocationPanelState) => void
  /** What the compact panel shows in place of `children`. */
  compact: ReactNode
}

export type CreateTaskMapLayoutProps = {
  /** Full-width strip above everything (e.g. email-verification banner). */
  banner?: ReactNode
  header?: ReactNode
  /** Phone/tablet progress strip. */
  progress?: ReactNode
  /** Desktop stepper rail (later steps). */
  stepper: ReactNode
  /** The one location map. Rendered once so it never remounts. */
  map: ReactNode
  /** Location step: full-screen map + bottom card. Otherwise a top band. */
  mapExpanded: boolean
  /** The location step's bottom card on phones and tablets. */
  panel: CreateTaskLocationPanel
  /** Over the band on later steps: the area, with a way back to the map. */
  bandOverlay?: ReactNode
  title: string
  description?: string
  errorText?: string | null
  actions: Omit<StepFlowActionsProps, 'sticky'>
  /** Step heading wrapper; the page focuses it after a step change. */
  headingRef?: Ref<HTMLDivElement>
  children: ReactNode
}

/**
 * Create-task shell. The map box animates between full screen (location
 * step) and the task-detail band behind the later steps; the Mapbox canvas
 * inside it is the same instance throughout, so the camera never jumps.
 *
 * Phones and tablets, location step (FE-349): the card is a pull-up panel.
 * Its body takes an explicit height (what the shown state's content
 * measures, or the finger while dragging) and the map box is sized to the
 * space above the card with the same transition, so Mapbox keeps the pin's
 * spot in the middle of the map that shows.
 */
export function CreateTaskMapLayout({
  banner,
  header,
  progress,
  stepper,
  map,
  mapExpanded,
  panel,
  bandOverlay,
  title,
  description,
  errorText,
  actions,
  headingRef,
  children,
}: CreateTaskMapLayoutProps) {
  const t = useI11n(bag).location
  const bodyId = useId()
  /** The map area: `main`, under the header and progress strip. */
  const [mainH, setMainH] = useState(0)
  /** The card without its body: the handle and the action bar. */
  const [chromeH, setChromeH] = useState(0)
  /** Body height each panel state's content needs (0 until measured). */
  const [contentH, setContentH] = useState<Record<LocationPanelState, number>>({
    compact: 0,
    expanded: 0,
  })
  const [dragH, setDragH] = useState<number | null>(null)
  const [seenState, setSeenState] = useState(panel.state)
  const [announcement, setAnnouncement] = useState('')
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const dragRef = useRef<PanelDrag | null>(null)
  const dragEndRef = useRef(Number.NEGATIVE_INFINITY)

  // Say when the panel opens or closes, whatever moved it.
  if (panel.state !== seenState) {
    setSeenState(panel.state)
    setAnnouncement(
      !mapExpanded
        ? ''
        : panel.state === 'expanded'
          ? t.detailsShown
          : t.detailsHidden,
    )
  }

  const expanded = panel.state === 'expanded'
  const dragging = dragH !== null
  // A drag shows the full content, whichever way the finger goes.
  const shown: LocationPanelState =
    expanded || dragging ? 'expanded' : 'compact'
  /** The tallest the body may be; the open content scrolls inside it. */
  const capH = mainH
    ? mainH * PANEL_MAX_SHARE - chromeH
    : Number.POSITIVE_INFINITY
  const openH = Math.min(contentH.expanded || capH, capH)
  // Until the shown content is measured, hold the other state's height.
  const bodyH = Math.min(
    dragH ?? (contentH[shown] || Math.max(contentH.compact, contentH.expanded)),
    capH,
  )

  // Child refs attach first, so the body and content are there to measure.
  const cardRef = useCallback((card: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!card) {
      // The step changed: a drag in progress can no longer get its pointerup.
      dragRef.current = null
      setDragH(null)
      return
    }
    const main = card.closest('main')
    const body = bodyRef.current
    const content = contentRef.current
    if (!main || !body || !content) return
    const observer = new ResizeObserver(() => {
      setMainH(main.offsetHeight)
      setChromeH(card.offsetHeight - body.offsetHeight)
      const state = content.dataset.panel as LocationPanelState
      const height = content.offsetHeight
      setContentH((prev) =>
        prev[state] === height ? prev : { ...prev, [state]: height },
      )
    })
    observer.observe(main)
    observer.observe(card)
    observer.observe(content)
    observerRef.current = observer
  }, [])

  const onHandlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const body = bodyRef.current
    if (!event.isPrimary || event.button !== 0 || !body) return
    try {
      // Moves keep coming to the handle when the finger slides off it.
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The pointer may already be gone.
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startH: body.offsetHeight,
      dragging: false,
      height: body.offsetHeight,
      samples: [],
    }
  }

  const onHandlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const pulled = drag.startY - event.clientY
    if (!drag.dragging && Math.abs(pulled) < SHEET_SLOP_PX) return
    drag.dragging = true
    drag.height = Math.min(
      Math.max(drag.startH + pulled, contentH.compact),
      openH,
    )
    drag.samples = [
      ...drag.samples.slice(-7),
      { t: event.timeStamp, offset: drag.height },
    ]
    setDragH(drag.height)
  }

  const onHandlePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (!drag.dragging) return
    dragEndRef.current = event.timeStamp
    setDragH(null)
    panel.onStateChange(
      resolveLocationPanelSnap({
        height: drag.height,
        compact: contentH.compact,
        expanded: openH,
        velocity: velocityFromSamples(drag.samples),
      }),
    )
  }

  const onHandleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.timeStamp - dragEndRef.current < CLICK_AFTER_DRAG_MS) return
    panel.onStateChange(expanded ? 'compact' : 'expanded')
  }

  const motion = {
    transitionProperty: 'height',
    // The finger moves the panel and the map directly.
    transitionDuration: dragging ? '0ms' : marketplaceMapMotion.duration,
    transitionTimingFunction: marketplaceMapMotion.easing,
  } as const

  const heading = (
    <Box ref={headingRef} tabIndex={-1} outline="none">
      <StepFlowHeading title={title} description={description} />
    </Box>
  )
  const error = errorText ? (
    <Text color="status.danger.fg" fontSize="sm" role="alert">
      {errorText}
    </Text>
  ) : null

  return (
    <Stack gap={0} flex={1} minH="100dvh" bg="bg.subtle">
      {banner}
      {header}
      <Box display={{ base: 'block', lg: 'none' }}>{progress}</Box>

      <Box
        as="main"
        position="relative"
        flex={1}
        display="flex"
        flexDirection="column"
        bg="bg.surface"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={0}
          // The space above the card, which the panel body's target height
          // (not its mid-animation one) decides, so both move together.
          h={
            mapExpanded
              ? {
                  base: `calc(100% - max(0px, var(--create-task-card-h) - ${CARD_MAP_OVERLAP_PX}px))`,
                  lg: '100%',
                }
              : MAP_BAND_H
          }
          style={
            {
              '--create-task-card-h': `${chromeH + bodyH}px`,
            } as CSSProperties
          }
          {...motion}
          css={{
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            // Keep the Mapbox logo/attribution clear of the card's rounded top.
            '& .mapboxgl-ctrl-bottom-left, & .mapboxgl-ctrl-bottom-right': {
              bottom: {
                base: mapExpanded ? `${CARD_MAP_OVERLAP_PX}px` : 0,
                lg: 0,
              },
            },
          }}
        >
          {map}
        </Box>

        {mapExpanded ? (
          <Box
            position="relative"
            zIndex={1}
            mt="auto"
            w="full"
            maxW={PAGE_CONTAINER_MAX_W}
            mx="auto"
            px={{ base: 0, lg: PAGE_GUTTER_X.lg }}
            pb={{ base: 0, lg: 6 }}
            pointerEvents="none"
          >
            <Box
              ref={cardRef}
              display="flex"
              flexDirection="column"
              maxW={{ lg: DESKTOP_LOCATION_CARD_W }}
              bg="bg.surface"
              borderTopRadius="2xl"
              borderBottomRadius={{ base: 0, lg: '2xl' }}
              borderWidth={{ base: 0, lg: '1px' }}
              borderColor="border.default"
              boxShadow="e2"
              overflow="clip"
              pointerEvents="auto"
              css={stageEnterCss}
            >
              <chakra.button
                type="button"
                display={{ base: 'flex', lg: 'none' }}
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                w="full"
                h={6}
                cursor={dragging ? 'grabbing' : 'grab'}
                touchAction="none"
                userSelect="none"
                borderTopRadius="2xl"
                _focusVisible={{ ...sdlFocusRing, outlineOffset: '-2px' }}
                aria-expanded={expanded}
                aria-controls={bodyId}
                aria-label={expanded ? t.hideDetails : t.showDetails}
                onPointerDown={onHandlePointerDown}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerEnd}
                onPointerCancel={onHandlePointerEnd}
                onClick={onHandleClick}
              >
                <Box
                  w="36px"
                  h="4px"
                  borderRadius="full"
                  bg="border.strong"
                  aria-hidden
                />
              </chakra.button>
              <Box
                ref={bodyRef}
                id={bodyId}
                h={{ base: 'var(--create-task-panel-h, auto)', lg: 'auto' }}
                style={
                  bodyH
                    ? ({
                        '--create-task-panel-h': `${bodyH}px`,
                      } as CSSProperties)
                    : undefined
                }
                overflowY={dragging ? 'hidden' : 'auto'}
                overscrollBehavior="contain"
                {...motion}
                css={{
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                }}
              >
                <Stack
                  ref={contentRef}
                  data-panel={shown}
                  // Compact: the area line reads as the title's subtitle.
                  gap={{ base: shown === 'compact' ? 1 : 4, lg: 4 }}
                  px={{ base: 4, md: 8, lg: 6 }}
                  pt={{ base: 0, lg: 5 }}
                  pb={{ base: shown === 'compact' ? 3 : 4, lg: 4 }}
                >
                  <Box ref={headingRef} tabIndex={-1} outline="none">
                    <Stack gap={1}>
                      <StepFlowHeading title={title} compact />
                      {description ? (
                        <Text
                          display={{
                            base: shown === 'expanded' ? 'block' : 'none',
                            lg: 'block',
                          }}
                          fontSize="sm"
                          color="text.muted"
                          lineHeight="tall"
                        >
                          {description}
                        </Text>
                      ) : null}
                    </Stack>
                  </Box>
                  {error}
                  <Box
                    display={{
                      base: shown === 'compact' ? 'block' : 'none',
                      lg: 'none',
                    }}
                  >
                    {panel.compact}
                  </Box>
                  <Stack
                    gap={4}
                    display={{
                      base: shown === 'expanded' ? 'flex' : 'none',
                      lg: 'flex',
                    }}
                  >
                    {children}
                  </Stack>
                </Stack>
              </Box>
              <StepFlowActions {...actions} sticky />
              <VisuallyHidden aria-live="polite" display={{ lg: 'none' }}>
                {announcement}
              </VisuallyHidden>
            </Box>
          </Box>
        ) : (
          <>
            <Box
              h={MAP_BAND_H}
              flexShrink={0}
              position="relative"
              pointerEvents="none"
            >
              {bandOverlay ? (
                // Top of the band, clear of the Mapbox logo and attribution.
                <Box position="absolute" insetX={0} top={3} zIndex={2}>
                  <Box
                    maxW={PAGE_CONTAINER_MAX_W}
                    mx="auto"
                    px={PAGE_GUTTER_X}
                    display="flex"
                  >
                    <Box pointerEvents="auto">{bandOverlay}</Box>
                  </Box>
                </Box>
              ) : null}
            </Box>
            <Grid
              position="relative"
              zIndex={1}
              flex={1}
              templateColumns={{
                base: '1fr',
                lg: 'minmax(280px, 320px) minmax(0, 1fr)',
              }}
              gap={{ base: 0, lg: 8 }}
              alignItems={{ base: 'stretch', lg: 'start' }}
              maxW={PAGE_CONTAINER_MAX_W}
              mx="auto"
              w="full"
              px={{ base: 0, lg: PAGE_GUTTER_X.lg }}
              pb={{ base: 0, lg: 8 }}
              css={stageEnterCss}
            >
              <Box
                display={{ base: 'none', lg: 'block' }}
                position="sticky"
                top={4}
                pt={2}
                px={2}
              >
                {stepper}
              </Box>
              <Box
                bg="bg.surface"
                borderRadius={{ base: 0, lg: '2xl' }}
                borderWidth={{ base: 0, lg: '1px' }}
                borderColor="border.default"
                boxShadow={{ base: 'none', lg: 'e2' }}
                display="flex"
                flexDirection="column"
                minW={0}
                overflow="clip"
              >
                <Stack
                  gap={6}
                  flex={1}
                  px={{ base: 4, md: 8, lg: 10 }}
                  pt={{ base: 5, md: 8 }}
                  pb={{ base: 4, md: 8 }}
                >
                  {heading}
                  {error}
                  {children}
                </Stack>
                <StepFlowActions {...actions} sticky />
              </Box>
            </Grid>
          </>
        )}
      </Box>
    </Stack>
  )
}
