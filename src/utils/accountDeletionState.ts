/**
 * Session flag for an account waiting for deletion (BE-74): set when any
 * request fails with ACCOUNT_DELETION_SCHEDULED, so the restore screen can
 * show even before `me` has the date.
 */

let flagged = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function markDeletionScheduled() {
  if (flagged) return
  flagged = true
  emit()
}

export function clearDeletionScheduled() {
  if (!flagged) return
  flagged = false
  emit()
}

export function getDeletionScheduledFlag() {
  return flagged
}

export function subscribeDeletionScheduled(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}
