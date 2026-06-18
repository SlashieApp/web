'use client'

import type { ReactNode } from 'react'

import { Stack } from '@chakra-ui/react'

import { WorkerSetupStepActions } from './WorkerSetupStepActions'
import { WorkerSetupStepHeading } from './WorkerSetupStepHeading'

type WorkerSetupStepPanelProps = {
  title: string
  description?: string
  children: ReactNode
  showBack?: boolean
  continueLabel?: string
  continueLoading?: boolean
  onBack?: () => void
  onContinue?: () => void
}

export function WorkerSetupStepPanel({
  title,
  description,
  children,
  showBack = false,
  continueLabel = 'Continue',
  continueLoading = false,
  onBack,
  onContinue,
}: WorkerSetupStepPanelProps) {
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
        <WorkerSetupStepHeading title={title} description={description} />
        {children}
      </Stack>

      <WorkerSetupStepActions
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
