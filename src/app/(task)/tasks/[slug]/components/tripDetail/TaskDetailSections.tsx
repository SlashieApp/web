'use client'

import { Stack } from '@chakra-ui/react'

import { TaskOverviewSections } from './TaskOverviewSections'
import { BookingSection } from './openTask/BookingSection'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TrustCard } from './openTask/TrustCard'

/**
 * Section stacks shared by both form factors. Desktop composes overview +
 * details in the left column; mobile renders each stack as its own tab.
 */

export function TaskInfoSections() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <TaskOverviewSections />
      <TaskDetailsSections />
    </Stack>
  )
}

export function TaskDetailsSections() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <PhotosCard />
      <TaskDetailsCard />
      <BookingSection />
    </Stack>
  )
}

export function TaskQuoteSections() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <QuotesPanel />
      <TrustCard />
    </Stack>
  )
}
