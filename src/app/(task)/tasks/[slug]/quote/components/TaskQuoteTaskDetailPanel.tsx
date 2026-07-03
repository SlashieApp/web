'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'

import { Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

type TaskQuoteTaskDetailPanelProps = {
  backHref: string
  variant?: 'sidebar' | 'section'
}

export function TaskQuoteTaskDetailPanel({
  backHref,
  variant = 'sidebar',
}: TaskQuoteTaskDetailPanelProps) {
  const { task } = useTaskDetail()
  if (!task) return null

  const isSection = variant === 'section'

  return (
    <Stack
      gap={4}
      w="full"
      h={isSection ? 'auto' : 'full'}
      minH={0}
      overflowY={isSection ? 'visible' : 'auto'}
      bg="bg.surface"
      borderRadius={isSection ? undefined : '2xl'}
      boxShadow={isSection ? undefined : 'sm'}
      borderWidth={isSection ? '0 0 1px 0' : '1px'}
      borderColor="border.default"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: isSection ? 4 : 6 }}
      flexShrink={0}
    >
      <Link
        href={backHref}
        fontSize="sm"
        fontWeight={600}
        color="text.link"
        display="inline-flex"
        alignItems="center"
        gap={1}
        w="fit-content"
        _hover={{ textDecoration: 'none', color: 'text.link' }}
      >
        <LuArrowLeft size={16} aria-hidden />
        Back to task
      </Link>

      <Stack gap={3}>
        <Heading
          size="lg"
          fontWeight={800}
          lineHeight="short"
          letterSpacing="-0.02em"
          color="text.default"
        >
          {task.title}
        </Heading>
        {task.description?.trim() ? (
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {task.description}
          </Text>
        ) : (
          <Text fontSize="sm" color="text.muted">
            No description provided.
          </Text>
        )}
      </Stack>
    </Stack>
  )
}
