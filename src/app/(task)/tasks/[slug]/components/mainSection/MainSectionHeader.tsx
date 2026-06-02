'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Tag } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { centerColumnStatusLabel } from '../../helpers/taskDetailUtils'
import { IconPin } from '../metaSection/VisitorMetaIcons'

function teaserDescription(text: string, maxLen = 160) {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen - 1)}…`
}

export function MainSectionHeader() {
  const { task, isOwner, myOrder } = useTaskDetail()
  if (!task) return null

  const taskStatusLabel = centerColumnStatusLabel(task, isOwner, myOrder)
  const place = taskPublicLocationLabel(task)
  const descriptionTeaser = task.description?.trim()
    ? teaserDescription(task.description)
    : null

  return (
    <Stack gap={4} w="full">
      <Tag color="primary">{taskStatusLabel}</Tag>
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
