'use client'

const PREFIX = 'slashie.worker.registered.v1:'

function key(userId: string) {
  return `${PREFIX}${userId}`
}

export function getWorkerRegistered(userId: string): boolean {
  if (typeof window === 'undefined' || !userId) return false
  return window.sessionStorage.getItem(key(userId)) === '1'
}

export function setWorkerRegistered(userId: string, active: boolean) {
  if (typeof window === 'undefined' || !userId) return
  if (active) window.sessionStorage.setItem(key(userId), '1')
  else window.sessionStorage.removeItem(key(userId))
}
