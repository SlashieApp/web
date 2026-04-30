'use client'

const PREFIX = 'slashie.worker.onboarding.v1:'

function key(userId: string) {
  return `${PREFIX}${userId}`
}

export function getWorkerOnboardingDraft<T>(userId: string): T | null {
  if (typeof window === 'undefined' || !userId) return null

  const rawValue = window.sessionStorage.getItem(key(userId))
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue) as T
  } catch {
    window.sessionStorage.removeItem(key(userId))
    return null
  }
}

export function setWorkerOnboardingDraft<T>(userId: string, value: T) {
  if (typeof window === 'undefined' || !userId) return
  window.sessionStorage.setItem(key(userId), JSON.stringify(value))
}

export function clearWorkerOnboardingDraft(userId: string) {
  if (typeof window === 'undefined' || !userId) return
  window.sessionStorage.removeItem(key(userId))
}
