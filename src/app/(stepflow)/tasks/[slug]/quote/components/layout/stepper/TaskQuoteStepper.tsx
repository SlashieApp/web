'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stepper } from '@ui'

import {
  TASK_QUOTE_MAJOR_STEPS,
  type TaskQuoteSubStepId,
  taskQuoteIsSubStepUnlocked,
} from '../../../helpers/taskQuoteSteps.config'
import bag from '../../../i11n.json'

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
  const t = useI11n(bag)
  return (
    <Stepper
      steps={TASK_QUOTE_MAJOR_STEPS.map((major) => ({
        id: major.id,
        label: t.majorSteps[major.id],
        subSteps: major.subSteps.map((sub) => ({
          id: sub.id,
          label: t.steps[sub.id].label,
        })),
      }))}
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
