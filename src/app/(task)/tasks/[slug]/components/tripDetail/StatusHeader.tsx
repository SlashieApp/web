'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { StatusPill } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { Reveal } from './Reveal'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

/**
 * The trip-detail hero anchor (Uber "Heading your way…" moment): a state headline,
 * one line of subtext, and the SDL StatusPill (dot + label, never colour alone).
 */
export function StatusHeader() {
  const { permissions, myQuote, isAuthenticated, task } = useTaskDetail()
  if (!task) return null

  const { pill, headline, subtext } = selectStatusHeaderCopy({
    permissions,
    myQuote,
    isAuthenticated,
    task,
  })

  return (
    <Reveal speed="slow">
      <Stack gap={3} w="full">
        <StatusPill status={pill} size="lg" />
        <Stack gap={2}>
          {/* SDL heading-lg / heading-xl: 24-28px, weight 600. */}
          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: '24px', md: '28px' }}
            fontWeight={600}
            lineHeight="1.2"
            color="text.default"
          >
            {headline}
          </Heading>
          {/* SDL text-lg: 18px / 1.55. */}
          <Text fontSize={{ base: 'md', md: 'lg' }} color="text.muted">
            {subtext}
          </Text>
        </Stack>
      </Stack>
    </Reveal>
  )
}
