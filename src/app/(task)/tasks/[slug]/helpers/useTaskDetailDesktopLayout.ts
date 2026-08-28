'use client'

import { useSyncExternalStore } from 'react'

/** Chakra `lg` — matches the search browse split and previous CSS task-detail split. */
const LG_UP = '(min-width: 1024px)'

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(LG_UP)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getSnapshot() {
  return window.matchMedia(LG_UP).matches
}

function getServerSnapshot() {
  return false
}

/**
 * Mount only one task-detail layout. Duplicate `view-transition-name`s across
 * the desktop + mobile trees would abort the whole navigation transition.
 * `useSyncExternalStore` reads matchMedia on the first client paint so a
 * desktop listing click snapshots the desktop destination, not the SSR mobile
 * fallback.
 */
export function useTaskDetailDesktopLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
