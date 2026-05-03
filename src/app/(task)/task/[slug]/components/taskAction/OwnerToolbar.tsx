'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import { TaskStatus } from '@codegen/schema'
import NextLink from 'next/link'

import { Button } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

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

export function OwnerToolbar() {
  const {
    isOwner,
    task,
    cancelingTask,
    onCancelTask,
    scrollToOwnerPerformance,
  } = useTaskDetail()
  if (!isOwner || !task) return null

  const cancelDisabled =
    task.status === TaskStatus.Cancelled ||
    task.status === TaskStatus.Completed ||
    task.status === TaskStatus.Confirmed

  return (
    <Stack gap={3} w="full">
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
        <Text fontWeight={500} color="cardFg">
          Details
        </Text>
      </HStack>

      <HStack gap={2} flexWrap="wrap">
        <Link
          as={NextLink}
          href="/requests"
          _hover={{ textDecoration: 'none' }}
        >
          <Button
            variant="secondary"
            borderColor="cardBorder"
            color="cardFg"
            bg="white"
            size="sm"
            borderRadius="lg"
          >
            <HStack gap={2}>
              <IconPencil />
              <span>Edit task</span>
            </HStack>
          </Button>
        </Link>
        <Button
          type="button"
          variant="secondary"
          borderColor="cardBorder"
          color="cardFg"
          bg="white"
          size="sm"
          borderRadius="lg"
          onClick={scrollToOwnerPerformance}
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
          loading={cancelingTask}
          disabled={cancelDisabled}
          onClick={() => void onCancelTask()}
        >
          <HStack gap={2}>
            <IconCancel />
            <span>Cancel task</span>
          </HStack>
        </Button>
      </HStack>
    </Stack>
  )
}
