'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback } from 'react'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Button, Tag } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { centerColumnStatusLabel } from '../../helpers/taskDetailUtils'
import { IconPin } from '../metaSection/VisitorMetaIcons'

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

function teaserDescription(text: string, maxLen = 160) {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen - 1)}…`
}

export function MainSectionHeader() {
  const { task, permissions, myOrder, cancelingTask, onCancelTask } =
    useTaskDetail()
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

  const taskStatusLabel = centerColumnStatusLabel(task, isOwner, myOrder)
  const place = taskPublicLocationLabel(task)
  const descriptionTeaser = task.description?.trim()
    ? teaserDescription(task.description)
    : null

  return (
    <Stack gap={4} w="full">
      <HStack
        justify="space-between"
        align="flex-start"
        gap={3}
        w="full"
        flexWrap="wrap"
      >
        <Tag color="primary">{taskStatusLabel}</Tag>
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
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        fontWeight={800}
        lineHeight="short"
        letterSpacing="-0.02em"
      >
        {task.title}
      </Heading>
      {descriptionTeaser ? (
        <Text
          fontSize="md"
          color="formLabelMuted"
          lineHeight="tall"
          display={{ base: 'block', xl: 'none' }}
        >
          {descriptionTeaser}
        </Text>
      ) : null}
      {place ? (
        <HStack
          align="flex-start"
          gap={2}
          minW={0}
          display={{ base: 'flex', xl: 'none' }}
        >
          <Box flexShrink={0} color="formLabelMuted" mt={0.5} aria-hidden>
            <IconPin />
          </Box>
          <Text
            fontSize="sm"
            fontWeight={600}
            color="cardFg"
            lineHeight="short"
          >
            {place}
          </Text>
        </HStack>
      ) : null}
    </Stack>
  )
}
