'use client'

import { Box } from '@chakra-ui/react'

import { ProgressBar } from '@ui'

import {
  type TaskQuoteSubStepId,
  taskQuoteStepCaption,
} from '../helpers/taskQuoteSteps.config'

type TaskQuoteProgressBarProps = {
  activeSubStep: TaskQuoteSubStepId
  progressPercent: number
}

export function TaskQuoteProgressBar({
  activeSubStep,
  progressPercent,
}: TaskQuoteProgressBarProps) {
  return (
    <Box
      w="full"
      px={{ base: 4, md: 6 }}
      py={3}
      bg="white"
      borderBottomWidth="1px"
      borderColor="cardBorder"
    >
      <ProgressBar
        value={progressPercent}
        label={taskQuoteStepCaption(activeSubStep)}
        trackLabel="Quote progress"
      />
    </Box>
  )
}
