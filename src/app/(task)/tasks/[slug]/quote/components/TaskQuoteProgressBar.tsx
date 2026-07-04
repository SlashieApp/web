'use client'

import { StepFlowProgress } from '@ui'

import {
  type TaskQuoteSubStepId,
  taskQuoteStepCaption,
} from '../helpers/taskQuoteSteps.config'

type TaskQuoteProgressBarProps = {
  activeSubStep: TaskQuoteSubStepId
  progressPercent: number
}

/** Quote-flow binding for the shared {@link StepFlowProgress} strip. */
export function TaskQuoteProgressBar({
  activeSubStep,
  progressPercent,
}: TaskQuoteProgressBarProps) {
  return (
    <StepFlowProgress
      value={progressPercent}
      label={taskQuoteStepCaption(activeSubStep)}
      trackLabel="Quote progress"
    />
  )
}
