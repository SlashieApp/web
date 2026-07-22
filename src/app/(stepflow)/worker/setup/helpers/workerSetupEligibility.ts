import type { MeSnapshot } from '@/app/(auth)/store/user'

/** Worker can send quotes once onboarding is complete on the server. */
export function isWorkerSetupComplete(
  me: MeSnapshot | null | undefined,
): boolean {
  if (!me?.worker?.id) return false
  return Boolean(me.worker.setupProgress?.isComplete)
}

/** Draft or in-progress worker row exists (setup started). */
export function hasWorkerDraft(me: MeSnapshot | null | undefined): boolean {
  return Boolean(me?.worker?.id)
}
