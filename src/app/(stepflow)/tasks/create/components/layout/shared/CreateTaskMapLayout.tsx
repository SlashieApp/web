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
  type ReactNode,
  type Ref,
  useCallback,
  useRef,
  useState,
} from 'react'

import { marketplaceMapMotion } from '@/app/(task)/helpers/marketplaceMap/motion'
import { COMPACT_DETAIL_HERO_H } from '@/app/(task)/helpers/marketplaceMap/overlay/config'
import { TASK_DETAIL_DESKTOP_MAP_SPACER } from '@/app/(task)/tasks/[slug]/helpers/taskDetailLayout'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlMotion } from '@/theme/styles'
import {
  StepFlowActions,
  type StepFlowActionsProps,
  StepFlowHeading,
} from '@ui'

/** Task-detail map band: visible map above the form on later steps. */
const MAP_BAND_H = {
  base: COMPACT_DETAIL_HERO_H.base,
  md: COMPACT_DETAIL_HERO_H.md,
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
 */
export function CreateTaskMapLayout({
  banner,
  header,
  progress,
  stepper,
  map,
  mapExpanded,
  title,
  description,
  errorText,
  actions,
  headingRef,
  children,
}: CreateTaskMapLayoutProps) {
  const [cardH, setCardH] = useState(0)
  const cardObserverRef = useRef<ResizeObserver | null>(null)

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
        compact={mapExpanded}
      />
    </Box>
  )
  const error = errorText ? (
    <Text color="status.danger.fg" fontSize="sm">
      {errorText}
    </Text>
  ) : null

  return (
    <Stack gap={0} flex={1} minH="100dvh" bg="bg.subtle">
      {banner}
      {header}
      <Box display={{ base: 'block', lg: 'none' }}>{progress}</Box>

      <Box
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
            mapExpanded
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
              <Stack gap={4} px={{ base: 4, md: 8, lg: 6 }} pt={5} pb={4}>
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
              h={MAP_BAND_H}
              flexShrink={0}
              pointerEvents="none"
              aria-hidden
            />
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
