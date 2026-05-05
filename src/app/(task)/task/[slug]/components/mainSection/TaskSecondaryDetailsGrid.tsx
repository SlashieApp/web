'use client'

import type { ReactNode } from 'react'

import { Box, Grid, HStack, Text } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskSecondaryFact,
  buildSecondaryTaskFacts,
} from '../../helpers/taskDetailUtils'

function IconWrench() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Tools</title>
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCrosshair() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Access</title>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 5v2M12 17v2M5 12h2M17 12h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconParking() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Parking</title>
      <path
        d="M6 3h7a5 5 0 0 1 0 10H10v8H6V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 7h3a2 2 0 1 1 0 4h-3V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPaw() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Pets</title>
      <ellipse
        cx="9"
        cy="9"
        rx="2"
        ry="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse
        cx="15"
        cy="9"
        rx="2"
        ry="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse
        cx="7"
        cy="15"
        rx="2"
        ry="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse
        cx="17"
        cy="15"
        rx="2"
        ry="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse
        cx="12"
        cy="17"
        rx="2.5"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

const FACT_ICONS: Record<TaskSecondaryFact['key'], ReactNode> = {
  tools: <IconWrench />,
  access: <IconCrosshair />,
  parking: <IconParking />,
  pets: <IconPaw />,
}

function FactCell({ fact }: { fact: TaskSecondaryFact }) {
  const icon = FACT_ICONS[fact.key] ?? <IconCrosshair />
  return (
    <HStack align="flex-start" gap={3} minW={0}>
      <Box flexShrink={0} color="formLabelMuted" mt={0.5} aria-hidden>
        {icon}
      </Box>
      <Box minW={0}>
        <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
          {fact.label}
        </Text>
        <Text fontSize="sm" fontWeight={600} color="cardFg" lineHeight="short">
          {fact.value}
        </Text>
      </Box>
    </HStack>
  )
}

export function TaskSecondaryDetailsGrid() {
  const { task } = useTaskDetail()
  if (!task) return null

  const facts = buildSecondaryTaskFacts(task)
  if (facts.length === 0) return null

  return (
    <Box
      w="full"
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="xl"
      bg="cardBg"
      p={{ base: 4, md: 5 }}
    >
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
        }}
        gapX={6}
        gapY={5}
      >
        {facts.map((fact) => (
          <FactCell key={fact.key} fact={fact} />
        ))}
      </Grid>
    </Box>
  )
}
