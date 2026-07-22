'use client'

import { Stepper } from '@ui'

import {
  CREATE_TASK_STEPPER_STEPS,
  type CreateTaskSubStepId,
  createTaskIsSubStepUnlocked,
} from '../../helpers/createTaskSteps.config'

type CreateTaskStepperProps = {
  activeSubStep: CreateTaskSubStepId
  completedSubSteps: ReadonlySet<string>
  onSelectSubStep: (id: CreateTaskSubStepId) => void
}

/** Task-creation binding for the shared @ui Stepper rail. */
export function CreateTaskStepper({
  activeSubStep,
  completedSubSteps,
  onSelectSubStep,
}: CreateTaskStepperProps) {
  return (
    <Stepper
      steps={CREATE_TASK_STEPPER_STEPS}
      activeSubStepId={activeSubStep}
      completedSubStepIds={completedSubSteps}
      isSubStepUnlocked={(id) =>
        createTaskIsSubStepUnlocked(
          id as CreateTaskSubStepId,
          activeSubStep,
          completedSubSteps,
        )
      }
      onSelectSubStep={(id) => onSelectSubStep(id as CreateTaskSubStepId)}
      maxW="320px"
    />
  )
}
