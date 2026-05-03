'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { TaskIntroText } from './TaskIntroText'
import { TaskVisitorMeta } from './TaskVisitorMeta'

export function TaskInfoSection(props: StackProps) {
  return (
    <Stack gap={4} w="full" {...props}>
      <TaskIntroText />
      <TaskVisitorMeta />
    </Stack>
  )
}
