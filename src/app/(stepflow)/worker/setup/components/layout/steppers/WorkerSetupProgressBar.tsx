'use client'

import { useI11n } from '@/i18n/useI11n'
import { StepFlowProgress } from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import { stepCaption } from '../../../helpers/workerSetupSteps.config'
import bag from '../../../i11n.json'

/** Worker-setup binding for the shared {@link StepFlowProgress} strip. */
export function WorkerSetupProgressBar() {
  const t = useI11n(bag)
  const { activeSubStep, progressPercent: percent } = useWorkerSetup()

  return (
    <StepFlowProgress
      value={percent}
      label={stepCaption(activeSubStep, t)}
      trackLabel={t.progressLabel}
    />
  )
}
