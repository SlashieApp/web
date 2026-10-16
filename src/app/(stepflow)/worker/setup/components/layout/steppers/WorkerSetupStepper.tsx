'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stepper } from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import { isScreenDone } from '../../../helpers/workerSetupScreens'
import bag from '../../../i11n.json'
import { WORKER_SETUP_SCREENS, type WorkerSetupScreenId } from '../../../views'

/** The six setup screens on the desktop rail; open ones are buttons. */
export function WorkerSetupStepper() {
  const screens = useI11n(bag).screens
  const { screen, completed, goToScreen, isScreenUnlocked } = useWorkerSetup()

  return (
    <Stepper
      steps={WORKER_SETUP_SCREENS.map((view) => ({
        id: view.screen,
        label: screens[view.screen].label,
      }))}
      activeSubStepId={screen}
      completedSubStepIds={WORKER_SETUP_SCREENS.filter((view) =>
        isScreenDone(view.screen, completed),
      ).map((view) => view.screen)}
      isSubStepUnlocked={(id) => isScreenUnlocked(id as WorkerSetupScreenId)}
      onSelectSubStep={(id) => goToScreen(id as WorkerSetupScreenId)}
      maxW="320px"
    />
  )
}
