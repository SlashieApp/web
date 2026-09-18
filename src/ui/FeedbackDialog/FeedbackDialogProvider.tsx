'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { FeedbackDialog } from './FeedbackDialog'
import type { FeedbackFormValues } from './feedbackFormSchema'

type FeedbackDialogContextValue = {
  open: () => void
}

const FeedbackDialogContext = createContext<FeedbackDialogContextValue | null>(
  null,
)

export function useFeedbackDialog(): FeedbackDialogContextValue | null {
  return useContext(FeedbackDialogContext)
}

/** Open the global product-feedback dialog. No-ops when no provider is mounted. */
export function useOpenFeedbackDialog(): () => void {
  const ctx = useFeedbackDialog()
  return ctx?.open ?? (() => undefined)
}

export type FeedbackDialogProviderProps = {
  children?: ReactNode
  onSubmit: (values: FeedbackFormValues) => Promise<boolean>
  submitting?: boolean
  submitError?: string
  defaultEmail?: string
  defaultName?: string
  emailLocked?: boolean
  onOpen?: () => void
}

export function FeedbackDialogProvider({
  children,
  onSubmit,
  submitting,
  submitError,
  defaultEmail,
  defaultName,
  emailLocked,
  onOpen,
}: FeedbackDialogProviderProps) {
  const [open, setOpen] = useState(false)

  const openDialog = useCallback(() => {
    onOpen?.()
    setOpen(true)
  }, [onOpen])

  const value = useMemo(() => ({ open: openDialog }), [openDialog])

  return (
    <FeedbackDialogContext.Provider value={value}>
      {children}
      <FeedbackDialog
        key={
          open ? `open:${defaultEmail ?? ''}:${defaultName ?? ''}` : 'closed'
        }
        open={open}
        onOpenChange={(next) => {
          if (!next) onOpen?.()
          setOpen(next)
        }}
        onSubmit={onSubmit}
        submitting={submitting}
        submitError={submitError}
        defaultEmail={defaultEmail}
        defaultName={defaultName}
        emailLocked={emailLocked}
      />
    </FeedbackDialogContext.Provider>
  )
}
