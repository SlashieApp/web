'use client'

import { StepFlowProgress } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { stepCaption } from '../helpers/workerSetupSteps.config'

/** Worker-setup binding for the shared {@link StepFlowProgress} strip. */
export function WorkerSetupProgressBar() {
  const { activeSubStep, progressPercent: percent } = useWorkerSetup()

  return (
    <StepFlowProgress
      value={percent}
      label={stepCaption(activeSubStep)}
      trackLabel="Worker setup progress"
    />
  )
}
