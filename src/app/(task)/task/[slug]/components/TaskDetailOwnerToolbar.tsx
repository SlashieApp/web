'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskDetailOwnerToolbarProps = {
  task: TaskDetailRecord
  openStatusLabel: string
  quotesReceivedLabel: string
  onViewStats: () => void
  onCancelTask: () => void
  cancelLoading: boolean
  cancelDisabled?: boolean
}

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Edit</title>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Stats</title>
      <path
        d="M18 20V10M12 20V4M6 20v-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCancel() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Cancel</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="m15 9-6 6M9 9l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TaskDetailOwnerToolbar({
  task,
  openStatusLabel,
  quotesReceivedLabel,
  onViewStats,
  onCancelTask,
  cancelLoading,
  cancelDisabled = false,
}: TaskDetailOwnerToolbarProps) {
  return (
    <Stack gap={5} w="full">
      <HStack gap={2} fontSize="sm" color="formLabelMuted" flexWrap="wrap">
        <Link
          as={NextLink}
          href="/requests"
          fontWeight={600}
          color="primary.700"
          _hover={{ color: 'primary.800', textDecoration: 'none' }}
        >
          My tasks
        </Link>
        <Text aria-hidden>/</Text>
        <Text fontWeight={500} color="jobCardTitle">
          Details
        </Text>
      </HStack>

      <Stack
        gap={4}
        flexDirection={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'flex-start' }}
        justify="space-between"
      >
        <Stack gap={3} flex={1} minW={0}>
          <HStack gap={2} flexWrap="wrap" align="center">
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              gap={2}
              px={3}
              py={1.5}
              borderRadius="full"
              bg="#F2994A"
              color="white"
              fontSize="11px"
              fontWeight={800}
              letterSpacing="0.08em"
            >
              <Box
                as="span"
                w="6px"
                h="6px"
                borderRadius="full"
                bg="white"
                aria-hidden
              />
              {openStatusLabel}
            </Box>
            <Box
              as="span"
              display="inline-flex"
              px={3}
              py={1.5}
              borderRadius="full"
              bg="badgeBg"
              color="jobCardTitle"
              fontSize="11px"
              fontWeight={700}
              letterSpacing="0.04em"
            >
              {quotesReceivedLabel}
            </Box>
          </HStack>
          <Heading
            size={{ base: 'xl', md: '2xl' }}
            fontWeight={800}
            lineHeight="shorter"
            color="ink.900"
          >
            {task.title}
          </Heading>
        </Stack>

        <HStack gap={2} flexWrap="wrap" flexShrink={0}>
          <NextLink href="/requests" passHref legacyBehavior>
            <Button
              as="a"
              variant="secondary"
              borderColor="cardBorder"
              color="jobCardTitle"
              bg="white"
              size="sm"
              borderRadius="lg"
            >
              <HStack gap={2}>
                <IconPencil />
                <span>Edit task</span>
              </HStack>
            </Button>
          </NextLink>
          <Button
            type="button"
            variant="secondary"
            borderColor="cardBorder"
            color="jobCardTitle"
            bg="white"
            size="sm"
            borderRadius="lg"
            onClick={onViewStats}
          >
            <HStack gap={2}>
              <IconChart />
              <span>View stats</span>
            </HStack>
          </Button>
          <Button
            type="button"
            variant="secondary"
            borderColor="red.200"
            color="red.700"
            bg="red.50"
            size="sm"
            borderRadius="lg"
            loading={cancelLoading}
            disabled={cancelDisabled}
            onClick={onCancelTask}
          >
            <HStack gap={2}>
              <IconCancel />
              <span>Cancel task</span>
            </HStack>
          </Button>
        </HStack>
      </Stack>
    </Stack>
  )
}
