'use client'

import { Box, HStack, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

export function TaskHeader() {
  const { task, isOwner } = useTaskDetail()
  const [saved, setSaved] = useState(false)

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

  const reportHref = useMemo(() => {
    if (!task) return '#'
    const subject = `Slashie: Report task (${task.id})`
    const body = `Task: ${task.title}\n\nPlease describe the issue:\n\n`
    return `mailto:support@slashie.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [task])

  if (!task) return null

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      w="full"
      bg="bg"
      borderBottomWidth="1px"
      borderColor="cardDivider"
      py={3}
      backdropFilter="blur(10px)"
    >
      <HStack
        justify="space-between"
        align="center"
        gap={{ base: 3, md: 4 }}
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
          flex={{ base: '1 1 auto', md: '0 0 auto' }}
          minW={0}
        >
          {isOwner ? (
            <Link
              as={NextLink}
              href="/requests"
              _hover={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm" borderRadius="lg">
                Edit
              </Button>
            </Link>
          ) : null}

          {!isOwner ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              borderRadius="lg"
              onClick={() => {
                window.location.href = reportHref
              }}
            >
              Report
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            borderRadius="lg"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>

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
