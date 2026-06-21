'use client'

import type { ReactNode } from 'react'

import { Stack } from '@chakra-ui/react'

import { TaskQuoteStepActions } from './TaskQuoteStepActions'
import { TaskQuoteStepHeading } from './TaskQuoteStepHeading'

type TaskQuoteStepPanelProps = {
  title: string
  description?: string
  children: ReactNode
  showBack?: boolean
  continueLabel?: string
  continueLoading?: boolean
  onBack?: () => void
  onContinue?: () => void
}

export function TaskQuoteStepPanel({
  title,
  description,
  children,
  showBack = false,
  continueLabel = 'Continue',
  continueLoading = false,
  onBack,
  onContinue,
}: TaskQuoteStepPanelProps) {
  return (
    <Stack gap={0} w="full" h="full" minH={0}>
      <Stack
        gap={6}
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 4, md: 8, lg: 10 }}
        py={{ base: 5, md: 8 }}
        pb={{ base: 4, md: 8 }}
      >
        <TaskQuoteStepHeading title={title} description={description} />
        {children}
      </Stack>

      <TaskQuoteStepActions
        showBack={showBack}
        continueLabel={continueLabel}
        continueLoading={continueLoading}
        onBack={onBack}
        onContinue={onContinue}
        sticky
      />
    </Stack>
  )
}
