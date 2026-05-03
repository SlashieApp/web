'use client'

import { Box, Heading, Stack } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { Button } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { centerColumnStatusLabel } from '../taskDetailUtils'

export function TaskMainHeader() {
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

  if (!task) return null

  const taskStatusLabel = centerColumnStatusLabel(task, isOwner)

  return (
    <Stack gap={4}>
      <Box
        as="span"
        display="inline-flex"
        alignSelf="flex-start"
        alignItems="center"
        px={3}
        py={1.5}
        borderRadius="full"
        bg="primary.100"
        color="primary.700"
        fontSize="11px"
        fontWeight={800}
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {taskStatusLabel}
      </Box>
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        fontWeight={800}
        lineHeight="short"
      >
        {task.title}
      </Heading>
      <Stack direction="row" gap={2} flexWrap="wrap">
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
      </Stack>
    </Stack>
  )
}
