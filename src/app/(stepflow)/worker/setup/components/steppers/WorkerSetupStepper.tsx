'use client'

import { Stepper } from '@ui'

import { useWorkerSetup } from '../../context/WorkerSetupProvider'
import {
  WORKER_SETUP_MAJOR_STEPS,
  type WorkerSetupSubStepId,
} from '../../helpers/workerSetupSteps.config'

export function WorkerSetupStepper() {
  const { activeSubStep, completedSubSteps, goToSubStep, isSubStepUnlocked } =
    useWorkerSetup()

  return (
    <Stepper
      steps={WORKER_SETUP_MAJOR_STEPS}
      activeSubStepId={activeSubStep}
      completedSubStepIds={completedSubSteps}
      isSubStepUnlocked={(id) => isSubStepUnlocked(id as WorkerSetupSubStepId)}
      onSelectSubStep={(id) => goToSubStep(id as WorkerSetupSubStepId)}
      maxW="320px"
    />
  )
}
