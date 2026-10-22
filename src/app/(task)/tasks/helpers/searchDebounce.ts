/** The filter rail applies the search this long after the last keystroke. */
export const SEARCH_DEBOUNCE_MS = 300

export type Debouncer = {
  /** Runs `run` after the delay. It replaces a call that is still waiting. */
  schedule: (run: () => void) => void
  /** Drops the call that is waiting, if any. */
  cancel: () => void
}

/** One call waits at a time; a newer call restarts the delay. */
export function createDebouncer(delayMs: number): Debouncer {
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer === null) return
    clearTimeout(timer)
    timer = null
  }

  const schedule = (run: () => void) => {
    cancel()
    timer = setTimeout(() => {
      timer = null
      run()
    }, delayMs)
  }

  return { schedule, cancel }
}
