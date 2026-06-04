'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback } from 'react'

import { Button } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

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

export function TaskHeader() {
  const { task, permissions, cancelingTask, onCancelTask } = useTaskDetail()
  const { isOwner, canEditTask, canCancelTask } = permissions

  const share = useCallback(async () => {
    if (!task) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: task.title, url })
      } else if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      /* user cancelled or clipboard blocked */
    }
  }, [task])

  if (!task) return null

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      // borderBottomWidth="1px"
      // borderColor="cardBorder"
      bg="bg"
      w="full"
      py={4}
    >
      <HStack
        justify="space-between"
        align="center"
        gap={{ base: 2, md: 3 }}
        flexWrap="wrap"
        w="full"
      >
        <Link
          as={NextLink}
          href="/"
          fontWeight={600}
          color="formLabelMuted"
          fontSize="sm"
          flexShrink={0}
          _hover={{ textDecoration: 'none', color: 'cardFg' }}
        >
          ← Back to browse
        </Link>

        <HStack
          gap={2}
          flexWrap="wrap"
          justify="flex-end"
          align="center"
          flexShrink={0}
        >
          {isOwner ? (
            <>
              {canEditTask ? (
                <Link
                  as={NextLink}
                  href={`/tasks/${task.id}/edit`}
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
              ) : null}
              {canCancelTask ? (
                <Button
                  type="button"
                  variant="secondary"
                  borderColor="red.200"
                  color="red.700"
                  bg="red.50"
                  size="sm"
                  borderRadius="lg"
                  loading={cancelingTask}
                  onClick={() => void onCancelTask()}
                >
                  <HStack gap={2}>
                    <IconCancel />
                    <span>Cancel task</span>
                  </HStack>
                </Button>
              ) : null}
            </>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            borderRadius="lg"
            onClick={() => void share()}
          >
            Share
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}
