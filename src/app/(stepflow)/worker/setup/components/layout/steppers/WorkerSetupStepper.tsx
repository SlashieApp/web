'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stepper } from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import {
  type WorkerSetupSubStepId,
  workerSetupStepsWithLabels,
} from '../../../helpers/workerSetupSteps.config'
import bag from '../../../i11n.json'

export function WorkerSetupStepper() {
  const t = useI11n(bag)
  const { activeSubStep, completedSubSteps, goToSubStep, isSubStepUnlocked } =
    useWorkerSetup()

  return (
    <Stepper
      steps={workerSetupStepsWithLabels(t)}
      activeSubStepId={activeSubStep}
      completedSubStepIds={completedSubSteps}
      isSubStepUnlocked={(id) => isSubStepUnlocked(id as WorkerSetupSubStepId)}
      onSelectSubStep={(id) => goToSubStep(id as WorkerSetupSubStepId)}
      maxW="320px"
    />
  )
}
