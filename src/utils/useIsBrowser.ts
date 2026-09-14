import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** Hydration-safe browser check (false on the server snapshot). */
export function useIsBrowser() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
