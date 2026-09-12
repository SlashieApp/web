'use client'

import { useCallback, useState } from 'react'

import { SafetyConfirmDialog } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

/**
 * Opens the C2C + meet-safely confirm before `onAcceptQuote`. Shared by the
 * 12-state QuotesModule and the older QuotesSection.
 */
export function useAcceptQuoteSafety() {
  const { onAcceptQuote, acceptingQuoteId } = useTaskDetail()
  const [pendingQuoteId, setPendingQuoteId] = useState<string | null>(null)

  const requestAccept = useCallback((quoteId: string) => {
    setPendingQuoteId(quoteId)
  }, [])

  const confirm = useCallback(() => {
    if (!pendingQuoteId) return
    const quoteId = pendingQuoteId
    setPendingQuoteId(null)
    void onAcceptQuote(quoteId)
  }, [onAcceptQuote, pendingQuoteId])

  const dialog = (
    <SafetyConfirmDialog
      open={pendingQuoteId != null}
      onOpenChange={(open) => {
        if (!open) setPendingQuoteId(null)
      }}
      onConfirm={confirm}
      confirmLoading={
        pendingQuoteId != null && acceptingQuoteId === pendingQuoteId
      }
    />
  )

  return { requestAccept, dialog }
}
