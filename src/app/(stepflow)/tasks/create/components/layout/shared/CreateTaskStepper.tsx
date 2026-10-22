'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stepper } from '@ui'

import { createTaskIsStepUnlocked } from '../../../helpers/createTaskSteps'
import bag from '../../../i11n.json'
import { CREATE_TASK_STEPS, type CreateTaskStepId } from '../../../views'

type CreateTaskStepperProps = {
  active: CreateTaskStepId
  done: ReadonlySet<CreateTaskStepId>
  onSelect: (id: CreateTaskStepId) => void
}

/** The six create steps on the desktop rail; any step already reached is a button. */
export function CreateTaskStepper({
  active,
  done,
  onSelect,
}: CreateTaskStepperProps) {
  const steps = useI11n(bag).steps
  return (
    <Stepper
      steps={CREATE_TASK_STEPS.map(({ step }) => ({
        id: step,
        label: steps[step].label,
      }))}
      activeSubStepId={active}
      completedSubStepIds={done}
      isSubStepUnlocked={(id) =>
        createTaskIsStepUnlocked(id as CreateTaskStepId, active, done)
      }
      onSelectSubStep={(id) => onSelect(id as CreateTaskStepId)}
      maxW="320px"
    />
  )
}
