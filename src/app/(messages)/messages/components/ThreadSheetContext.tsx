'use client'

import { createContext, useContext } from 'react'

import type { FlashQuote } from './ThreadQuote'

/**
 * What the thread's sheet shows (FE-543): the booking (its actions and what
 * needs the viewer), one quote, or, before a booking, what needs the viewer
 * (an invitation to quote).
 */
export type ThreadSheetTarget =
  | { kind: 'booking' }
  | { kind: 'quote'; quote: FlashQuote }
  | { kind: 'needs' }

export type ThreadSheetControls = {
  open: (target: ThreadSheetTarget) => void
  close: () => void
  /**
   * The other person's reschedule or cancel request waits on the viewer: the
   * newest request in the timeline offers to open it.
   */
  requestPending: boolean
}

export const ThreadSheetContext = createContext<ThreadSheetControls | null>(
  null,
)

/** The thread's sheet, or null outside a task thread (nothing to open). */
export function useThreadSheet(): ThreadSheetControls | null {
  return useContext(ThreadSheetContext)
}
