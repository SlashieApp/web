'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Stack, Text, useBreakpointValue } from '@chakra-ui/react'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'
import { TaskDetailLocationMap } from './TaskDetailLocationMap'
import {
  budgetKindLabel,
  taskAvailabilityRangeLabel,
  taskBudgetDisplayLine,
  taskMapCoordinates,
} from './taskDetailUtils'

function MetaRow({
  label,
  children,
  icon,
}: {
  label: string
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <HStack align="flex-start" gap={3}>
      <Box flexShrink={0} color="formLabelMuted" mt={0.5} aria-hidden>
        {icon}
      </Box>
      <Stack gap={0} flex={1} minW={0}>
        <Text fontSize="xs" fontWeight={600} color="formLabelMuted">
          {label}
        </Text>
        <Box fontSize="sm" fontWeight={600} color="cardFg" lineHeight="short">
          {children}
        </Box>
      </Stack>
    </HStack>
  )
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Clock</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Location</title>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" />
    </svg>
  )
}

function IconWallet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Budget</title>
      <path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M17 12h4v4h-4a2 2 0 1 1 0-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Calendar</title>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 3v4M16 3v4M3 11h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function TaskDetailVisitorSidebar() {
  const { task, me, isOwner } = useTaskDetail()
  if (!task) return null

  const showRailMap =
    useBreakpointValue({ base: false, xl: true }, { fallback: 'base' }) ?? false
  const place = taskPublicLocationLabel(task)
  const coords = taskMapCoordinates(task)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const budgetLine = taskBudgetDisplayLine(
    task,
    isOwner ? 'owner' : 'visitor',
    me?.id,
  )
  const budgetBadge = budgetKindLabel(task.budget?.type)
  const timing = taskAvailabilityRangeLabel(task)

  return (
    <Stack gap={5} w="full">
      {showRailMap && coords && mapboxToken?.trim() ? (
        <Stack gap={2}>
          <Box
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="cardBorder"
          >
            <TaskDetailLocationMap
              accessToken={mapboxToken}
              lat={coords.lat}
              lng={coords.lng}
              height="160px"
            />
          </Box>
        </Stack>
      ) : null}

      <Stack gap={0}>
        <Box pb={4} borderBottomWidth="1px" borderColor="cardDivider">
          <MetaRow label="Posted" icon={<IconClock />}>
            {formatRelativeTime(task.createdAt)}
          </MetaRow>
        </Box>
        <Box py={4} borderBottomWidth="1px" borderColor="cardDivider">
          <MetaRow label="Location" icon={<IconPin />}>
            {place || 'Location shared after you accept a quote'}
          </MetaRow>
        </Box>
        <Box py={4} borderBottomWidth="1px" borderColor="cardDivider">
          <MetaRow label="Budget" icon={<IconWallet />}>
            <HStack gap={2} flexWrap="wrap" align="center">
              <Text as="span" fontSize="sm" fontWeight={600}>
                {budgetLine}
              </Text>
              {budgetBadge ? (
                <Badge
                  px={2}
                  py={0.5}
                  fontSize="10px"
                  fontWeight={700}
                  bg="primary.100"
                  color="primary.700"
                >
                  {budgetBadge}
                </Badge>
              ) : null}
            </HStack>
          </MetaRow>
        </Box>
        <Box pt={4}>
          <MetaRow label="Timing" icon={<IconCalendar />}>
            {timing}
          </MetaRow>
        </Box>
      </Stack>
    </Stack>
  )
}
