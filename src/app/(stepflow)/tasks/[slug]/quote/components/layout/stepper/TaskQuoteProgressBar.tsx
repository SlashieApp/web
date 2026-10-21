'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { StepFlowProgress } from '@ui'

import {
  type TaskQuoteSubStepId,
  taskQuoteStepPosition,
} from '../../../helpers/taskQuoteSteps.config'
import bag from '../../../i11n.json'

type TaskQuoteProgressBarProps = {
  activeSubStep: TaskQuoteSubStepId
  progressPercent: number
}

/** Quote-flow binding for the shared {@link StepFlowProgress} strip. */
export function TaskQuoteProgressBar({
  activeSubStep,
  progressPercent,
}: TaskQuoteProgressBarProps) {
  const t = useI11n(bag)
  return (
    <StepFlowProgress
      value={progressPercent}
      label={formatMessage(t.progress, {
        ...taskQuoteStepPosition(activeSubStep),
        label: t.steps[activeSubStep].label,
      })}
      trackLabel={t.progressTrack}
    />
  )
}
