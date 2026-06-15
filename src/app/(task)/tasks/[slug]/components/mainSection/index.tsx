'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_GAP } from '../../helpers/taskDetailLayout'

import { MainSectionContent } from './MainSectionContent'
import { MainSectionHeader } from './MainSectionHeader'
import { MainSectionPrimaryMeta } from './MainSectionPrimaryMeta'

export function MainSection(props: StackProps) {
  const { task } = useTaskDetail()
  if (!task) return null

  return (
    <Stack gap={TASK_DETAIL_SECTION_GAP} w="full" {...props}>
      <MainSectionHeader />
      <MainSectionPrimaryMeta />
      <MainSectionContent />
    </Stack>
  )
}
