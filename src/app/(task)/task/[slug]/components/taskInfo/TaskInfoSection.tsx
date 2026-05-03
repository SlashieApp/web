'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { BackToBrowseLink } from './BackToBrowseLink'
import { TaskIntroText } from './TaskIntroText'
import { TaskVisitorMeta } from './TaskVisitorMeta'

export function TaskInfoSection(props: StackProps) {
  return (
    <Stack gap={4} w="full" {...props}>
      <BackToBrowseLink />
      <TaskIntroText />
      <TaskVisitorMeta />
    </Stack>
  )
}
