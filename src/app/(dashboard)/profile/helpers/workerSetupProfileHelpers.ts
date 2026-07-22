import type { MeSnapshot } from '@/app/(auth)/store/user'

import {
  WORKER_SETUP_FLAT_STEPS,
  type WorkerSetupSubStepId,
  subStepConfig,
} from '@/app/(stepflow)/worker/setup/helpers/workerSetupSteps.config'

export function isWorkerSetupInProgress(
  me: MeSnapshot | null | undefined,
): boolean {
  if (!me?.worker?.id) return false
  return !me.worker.setupProgress?.isComplete
}

export function workerSetupProgressPercent(
  me: MeSnapshot | null | undefined,
): number {
  const total = WORKER_SETUP_FLAT_STEPS.length
  if (total <= 0) return 0
  const completed = me?.worker?.setupProgress?.completedSubSteps?.length ?? 0
  return Math.round((completed / total) * 100)
}

export function workerSetupCurrentStepLabel(
  me: MeSnapshot | null | undefined,
): string {
  const id = me?.worker?.setupProgress?.currentSubStep
  if (!id) return 'Personal details'
  return subStepConfig(id as WorkerSetupSubStepId)?.label ?? 'Worker setup'
}
