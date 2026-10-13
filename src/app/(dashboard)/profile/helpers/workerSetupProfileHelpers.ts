import type { MeSnapshot } from '@/app/(auth)/store/user'

export function isWorkerSetupInProgress(
  me: MeSnapshot | null | undefined,
): boolean {
  if (!me?.worker?.id) return false
  return !me.worker.setupProgress?.isComplete
}
