'use client'

import { Stepper } from '@ui'

import {
  TASK_QUOTE_MAJOR_STEPS,
  type TaskQuoteSubStepId,
  taskQuoteIsSubStepUnlocked,
} from '../../helpers/taskQuoteSteps.config'

type TaskQuoteStepperProps = {
  activeSubStep: TaskQuoteSubStepId
  completedSubSteps: ReadonlySet<string>
  onSelectSubStep: (id: TaskQuoteSubStepId) => void
}

export function TaskQuoteStepper({
  activeSubStep,
  completedSubSteps,
  onSelectSubStep,
}: TaskQuoteStepperProps) {
  return (
    <Stepper
      steps={TASK_QUOTE_MAJOR_STEPS}
      activeSubStepId={activeSubStep}
      completedSubStepIds={completedSubSteps}
      isSubStepUnlocked={(id) =>
        taskQuoteIsSubStepUnlocked(
          id as TaskQuoteSubStepId,
          activeSubStep,
          completedSubSteps,
        )
      }
      onSelectSubStep={(id) => onSelectSubStep(id as TaskQuoteSubStepId)}
      maxW="320px"
    />
  )
}
