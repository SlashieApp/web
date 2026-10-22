'use client'

import {
  Box,
  Grid,
  Stack,
  type SystemStyleObject,
  Text,
} from '@chakra-ui/react'
import {
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useRef,
  useState,
} from 'react'

import { marketplaceMapMotion } from '@/app/(task)/helpers/marketplaceMap/motion'
import { TASK_DETAIL_DESKTOP_MAP_SPACER } from '@/app/(task)/tasks/[slug]/helpers/taskDetailLayout'
import { WEB_MIN_PX } from '@/theme/breakpoints'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlMotion } from '@/theme/styles'
import {
  StepFlowActions,
  type StepFlowActionsProps,
  StepFlowHeading,
} from '@ui'

import type { CreateTaskMapMode } from '../../../views'

/**
 * Room the sticky Continue bar takes at the bottom of the screen, so a field
 * the browser scrolls into view stops above the bar instead of under it.
 */
const fieldsClearStickyBarCss = {
  '& input, & textarea, & select': { scrollMarginBottom: '112px' },
} as SystemStyleObject

/**
 * Some Android browsers (Arc, in-app browsers) shrink the window for the
 * keyboard, and the sticky Continue bar rises with it over the focused
 * field. While a field has focus, bring it to the middle of the screen
 * whenever the window or the visual viewport resizes (FE-352).
 */
function keepFocusedFieldInView(event: FocusEvent<HTMLDivElement>) {
  const field = event.target
  if (
    !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)
  ) {
    return
  }
  const reveal = () => field.scrollIntoView({ block: 'center' })
  const viewport = window.visualViewport
  window.addEventListener('resize', reveal)
  viewport?.addEventListener('resize', reveal)
  field.addEventListener(
    'blur',
    () => {
      window.removeEventListener('resize', reveal)
      viewport?.removeEventListener('resize', reveal)
    },
    { once: true },
  )
}

/**
 * The map band above the form. Short on phones and tablets (FE-295) so the
 * first field sits above the fold; desktop matches task detail.
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

/** Phones and tablets: the compact shell, below `lg`. */
const COMPACT_MQ = `@media screen and (max-width: ${WEB_MIN_PX - 0.02}px)`

/** The same screens, when the device allows motion. */
const COMPACT_MOTION_MQ = `${COMPACT_MQ} and (prefers-reduced-motion: no-preference)`

/**
 * How long the phone form takes to slide over or off the map band (FE-355):
 * the SDL `slow` duration, with the standard easing.
 */
export const CREATE_TASK_SHEET_MS = Number.parseInt(sdlMotion.duration.slow, 10)

/** Address step to details on phones: the form slides up from the bottom over the band. */
const formRisesCss = {
  [COMPACT_MOTION_MQ]: {
    animationName: 'slide-from-bottom-full',
    animationDuration: sdlMotion.duration.slow,
    animationTimingFunction: sdlMotion.easing.standard,
  },
} as SystemStyleObject

/** Back to the address step on phones: the band opens again, sliding the form down. */
const bandOpensCss = {
  [COMPACT_MOTION_MQ]: {
    transitionProperty: 'height',
    transitionDuration: sdlMotion.duration.slow,
    transitionTimingFunction: sdlMotion.easing.standard,
  },
} as SystemStyleObject

/**
 * Phones, full-screen form: the map behind it hides once the form has slid
 * over it, or at once (reduced motion, a saved draft opening on a later
 * step), so it never shows through while the form fades in.
 */
const mapCoveredCss = {
  [COMPACT_MQ]: { visibility: 'hidden' },
  [COMPACT_MOTION_MQ]: {
    transitionProperty: 'height, visibility',
    transitionDuration: `${marketplaceMapMotion.duration}, 0s`,
    transitionDelay: `0s, ${sdlMotion.duration.slow}`,
  },
} as SystemStyleObject

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
  /**
   * `full`: the location step's full-screen map and short card. `band`: the
   * map band above the form. `desktopBand`: the band on desktop only; below
   * `lg` the form takes the whole screen (FE-355).
   */
  mapMode: CreateTaskMapMode
  /** Over the band: the area, with a way back to the map. */
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
 * Location step on phones and tablets (FE-352): a short card at the bottom,
 * and the map box sized to the space above it, so Mapbox keeps the pin in
 * the middle of the map that shows.
 *
 * From the details step on, phones and tablets give the form the whole
 * screen (FE-355): the header and progress strip, the step heading, the
 * fields and the sticky Back and Continue. Leaving the address step, the
 * form slides up from the bottom over the band; Back to it slides the form
 * down to open the band again. Between full-screen steps only the content
 * changes. Reduced motion: no slide. Desktop keeps the band.
 */
export function CreateTaskMapLayout({
  banner,
  header,
  progress,
  stepper,
  map,
  mapMode,
  bandOverlay,
  title,
  description,
  errorText,
  actions,
  headingRef,
  children,
}: CreateTaskMapLayoutProps) {
  const [cardH, setCardH] = useState(0)
  const cardObserverRef = useRef<ResizeObserver | null>(null)
  // The previous step's map mode: the form rises over the band only when it
  // leaves the address step, not when a saved draft opens on a later step.
  const [modes, setModes] = useState({ now: mapMode, before: mapMode })
  if (modes.now !== mapMode) setModes({ now: mapMode, before: modes.now })
  const mapFull = mapMode === 'full'
  const formFullScreen = mapMode === 'desktopBand'
  const formRises = formFullScreen && modes.before === 'band'

  const cardRef = useCallback((node: HTMLDivElement | null) => {
    cardObserverRef.current?.disconnect()
    cardObserverRef.current = null
    if (!node) return
    const observer = new ResizeObserver(() => setCardH(node.offsetHeight))
    observer.observe(node)
    cardObserverRef.current = observer
  }, [])

  const heading = (
    <Box ref={headingRef} tabIndex={-1} outline="none">
      <StepFlowHeading
        title={title}
        description={description}
        compact={mapFull}
      />
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
          h={
            mapFull
              ? {
                  base: 'calc(100% - var(--create-task-card-cover))',
                  lg: '100%',
                }
              : MAP_BAND_H
          }
          style={
            {
              '--create-task-card-cover': `${Math.max(0, cardH - CARD_MAP_OVERLAP_PX)}px`,
            } as CSSProperties
          }
          transitionProperty="height"
          transitionDuration={marketplaceMapMotion.duration}
          transitionTimingFunction={marketplaceMapMotion.easing}
          css={[
            {
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              // Keep the Mapbox logo/attribution clear of the card's rounded top.
              '& .mapboxgl-ctrl-bottom-left, & .mapboxgl-ctrl-bottom-right': {
                bottom: {
                  base: mapFull ? `${CARD_MAP_OVERLAP_PX}px` : 0,
                  lg: 0,
                },
              },
            },
            formFullScreen ? mapCoveredCss : {},
          ]}
        >
          {map}
        </Box>

        {mapFull ? (
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
              {/* Tighter on phones, so the map keeps half the screen. */}
              <Stack
                gap={{ base: 2, lg: 4 }}
                px={{ base: 4, md: 8, lg: 6 }}
                pt={{ base: 2, lg: 5 }}
                pb={{ base: 2, lg: 4 }}
              >
                {heading}
                {error}
                {children}
              </Stack>
              <StepFlowActions {...actions} sticky />
            </Box>
          </Box>
        ) : (
          <>
            <Box
              // Room for the band and its overlay. Phones and tablets close
              // it from the details step on: the form takes the whole screen.
              h={formFullScreen ? { base: 0, lg: MAP_BAND_H.lg } : MAP_BAND_H}
              flexShrink={0}
              position="relative"
              pointerEvents="none"
              css={formFullScreen ? undefined : bandOpensCss}
            >
              {bandOverlay ? (
                // Top of the band, clear of the Mapbox logo and attribution,
                // and under the form, which slides over and off it on phones.
                <Box
                  position="absolute"
                  insetX={0}
                  top={3}
                  zIndex={1}
                  display={
                    formFullScreen ? { base: 'none', lg: 'block' } : 'block'
                  }
                >
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
                css={formRises ? formRisesCss : undefined}
              >
                <Stack
                  gap={6}
                  flex={1}
                  px={{ base: 4, md: 8, lg: 10 }}
                  pt={{ base: 5, md: 8 }}
                  pb={{ base: 4, md: 8 }}
                  css={fieldsClearStickyBarCss}
                  onFocus={keepFocusedFieldInView}
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
