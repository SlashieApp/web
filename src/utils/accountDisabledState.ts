/** Session-level suspension flag (survives `me` failing with ACCOUNT_DISABLED). */

let flagged = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function markAccountDisabled() {
  if (flagged) return
  flagged = true
  emit()
}

export function clearAccountDisabled() {
  if (!flagged) return
  flagged = false
  emit()
}

export function getAccountDisabledFlag() {
  return flagged
}

export function subscribeAccountDisabled(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}
