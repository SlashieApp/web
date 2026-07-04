'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'

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
  const { permissions, myQuote, isAuthenticated, task, myOrder } =
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
      <Reveal speed="slow">
        <Stack gap={3} w="full">
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
    </TaskLocationHeroMap>
  )
}
