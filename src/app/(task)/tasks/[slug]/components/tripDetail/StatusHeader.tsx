'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import bag from '../../i11n.json'

import { sdlMotion } from '@/theme/styles'
import { TaskStatusPill } from './TaskStatusPill'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { buildTaskDetailMapPinTask } from '../../helpers/taskLocationMap'
import { Reveal } from './Reveal'
import { TaskHeaderControls } from './TaskHeaderControls'
import { TaskLocationHeroMap } from './openTask/TaskLocationHeroMap'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

const heroTextShadow = '0 1px 2px rgba(255, 255, 255, 0.75)'

/**
 * The trip-detail hero anchor (Uber "Heading your way…" moment): an interactive
 * map backdrop with a state headline, one line of subtext, and the SDL
 * StatusPill overlaid on a legibility scrim.
 */
export function StatusHeader({ collapsed = false }: { collapsed?: boolean }) {
  const {
    permissions,
    myQuote,
    isAuthenticated,
    task,
    myOrder,
    me,
    statusReady,
  } = useTaskDetail()
  const t = useI11n(bag)

  const coords = task ? taskDetailMapCoordinates(task, myOrder) : null
  const showExact = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })
  const lat = coords?.lat
  const lng = coords?.lng

  // Same interactive treatment as the desktop map background: expanded price
  // pin + route-from-viewer when the exact location is shared. Memoized so the
  // map-mounting callback ref in TaskLocationHeroMap keeps a stable identity —
  // a fresh object here would tear down and recreate the Mapbox instance on
  // every re-render (e.g. each collapse flip while scrolling).
  const pinTask = useMemo(() => {
    if (!task || !showExact || lat == null || lng == null) return undefined
    return buildTaskDetailMapPinTask(
      task,
      { lat, lng },
      permissions.isOwner ? 'owner' : 'visitor',
      me?.id,
    )
  }, [task, showExact, lat, lng, permissions.isOwner, me?.id])

  if (!task) return null

  const { pill, headline, subtext } = selectStatusHeaderCopy(
    {
      permissions,
      myQuote,
      isAuthenticated,
      task,
    },
    t.statusHeader,
  )
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  return (
    <TaskLocationHeroMap
      accessToken={token}
      lat={coords?.lat}
      lng={coords?.lng}
      variant={showExact ? 'exact' : 'approximate'}
      enableRoute={showExact}
      pinTask={pinTask}
      hideMap={collapsed}
      minH={{ base: '260px', md: '300px' }}
    >
      {/* Back · overflow controls over the map, matching the desktop header.
          Hidden (incl. tab order) once the compact sticky bar — which carries
          its own pair — takes over on scroll. */}
      <TaskHeaderControls overlay hidden={collapsed} />

      <Box flex={1} />
      {statusReady ? (
        <Reveal speed="slow">
          <Stack
            gap={3}
            w="full"
            animation={`rise-in 0.35s ${sdlMotion.easing.decelerate}`}
          >
            <TaskStatusPill status={pill} size="lg" alignSelf="flex-start" />
            <Stack gap={2}>
              <Heading
                as="h1"
                fontFamily="heading"
                fontSize={{ base: '24px', md: '28px' }}
                fontWeight={600}
                lineHeight="1.2"
                color="text.default"
                textShadow={heroTextShadow}
              >
                {headline}
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="text.muted"
                textShadow={heroTextShadow}
              >
                {subtext}
              </Text>
            </Stack>
          </Stack>
        </Reveal>
      ) : (
        // Viewer state unconfirmed — skeleton the status copy instead of
        // flashing a guessed (often wrong) state.
        <Stack gap={3} w="full" aria-busy>
          <Skeleton h="28px" w="92px" borderRadius="full" />
          <Skeleton h="28px" w="min(300px, 78%)" borderRadius="md" />
          <Skeleton h="18px" w="min(360px, 92%)" borderRadius="md" />
        </Stack>
      )}
    </TaskLocationHeroMap>
  )
}
