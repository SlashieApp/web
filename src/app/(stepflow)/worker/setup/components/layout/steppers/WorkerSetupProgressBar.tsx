'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { StepFlowProgress } from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import {
  WORKER_SETUP_SCREEN_COUNT,
  screenNumber,
} from '../../../helpers/workerSetupScreens'
import bag from '../../../i11n.json'

/** Phones: "Step 2 of 6 · Your work" above the screen. */
export function WorkerSetupProgressBar() {
  const t = useI11n(bag)
  const { screen } = useWorkerSetup()
  const current = screenNumber(screen)

  return (
    <StepFlowProgress
      value={Math.round((current / WORKER_SETUP_SCREEN_COUNT) * 100)}
      label={formatMessage(t.progressCaption, {
        current,
        total: WORKER_SETUP_SCREEN_COUNT,
        label: t.screens[screen].label,
      })}
      trackLabel={t.progressLabel}
    />
  )
}
