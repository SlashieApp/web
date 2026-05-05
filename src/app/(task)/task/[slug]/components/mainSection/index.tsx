'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'

import { MainSectionContent } from './MainSectionContent'
import { MainSectionHeader } from './MainSectionHeader'

export function MainSection(props: StackProps) {
  const { task } = useTaskDetail()
  if (!task) return null

  return (
    <Stack gap={{ base: 6, lg: 8 }} w="full" {...props}>
      <MainSectionHeader />
      <MainSectionContent />
    </Stack>
  )
}
