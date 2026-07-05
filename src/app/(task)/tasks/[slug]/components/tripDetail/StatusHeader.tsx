'use client'

import { Box, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'

import { sdlMotion } from '@/theme/styles'
import { StatusPill } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { Reveal } from './Reveal'
import { TaskLocationHeroMap } from './openTask/TaskLocationHeroMap'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

const heroTextShadow = '0 1px 2px rgba(255, 255, 255, 0.75)'

/**
 * The trip-detail hero anchor (Uber "Heading your way…" moment): an interactive
 * map backdrop with a state headline, one line of subtext, and the SDL
 * StatusPill overlaid on a legibility scrim.
 */
export function StatusHeader({ collapsed = false }: { collapsed?: boolean }) {
  const { permissions, myQuote, isAuthenticated, task, myOrder, statusReady } =
    useTaskDetail()
  if (!task) return null

  const { pill, headline, subtext } = selectStatusHeaderCopy({
    permissions,
    myQuote,
    isAuthenticated,
    task,
  })

  const coords = taskDetailMapCoordinates(task, myOrder)
  const showExact = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  return (
    <TaskLocationHeroMap
      accessToken={token}
      lat={coords?.lat}
      lng={coords?.lng}
      variant={showExact ? 'exact' : 'approximate'}
      hideMap={collapsed}
      minH={{ base: '260px', md: '300px' }}
    >
      <Box flex={1} />
      {statusReady ? (
        <Reveal speed="slow">
          <Stack
            gap={3}
            w="full"
            animation={`rise-in 0.35s ${sdlMotion.easing.decelerate}`}
          >
            <StatusPill status={pill} size="lg" alignSelf="flex-start" />
            <Stack gap={2}>
              <Heading
                as="h1"
                fontFamily="heading"
                fontSize={{ base: '24px', md: '28px' }}
                fontWeight={600}
                lineHeight="1.2"
                color="gray.900"
                textShadow={heroTextShadow}
              >
                {headline}
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.700"
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
