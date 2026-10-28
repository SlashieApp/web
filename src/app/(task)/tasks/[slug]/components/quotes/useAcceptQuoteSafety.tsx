'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { useLocale } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import {
  type TimeSlotLike,
  formatTimeSlotLabel,
  isTimeSlotPast,
} from '@/utils/timeSlots'
import { RadioButton, SafetyConfirmDialog } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

type AcceptableQuote = {
  id: string
  proposedSlots: readonly (TimeSlotLike & { id: string })[]
}

/**
 * Accept confirm without task-detail context: the owner picks one of the
 * quote's proposed times (it becomes the booking), then sees the C2C +
 * meet-safely notice. Messages uses this directly (BE-81).
 */
export function useAcceptQuoteDialog({
  quotes,
  onAccept,
  acceptingQuoteId,
}: {
  quotes: readonly AcceptableQuote[]
  onAccept: (quoteId: string, slotId: string) => unknown
  acceptingQuoteId: string | null
}) {
  const q = useI11n(bag).quotes
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const [pendingQuoteId, setPendingQuoteId] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)

  const slots =
    quotes.find((quote) => quote.id === pendingQuoteId)?.proposedSlots ?? []
  const futureSlots = slots.filter((slot) => !isTimeSlotPast(slot))

  const requestAccept = useCallback(
    (quoteId: string) => {
      const proposed =
        quotes.find((quote) => quote.id === quoteId)?.proposedSlots ?? []
      const open = proposed.filter((slot) => !isTimeSlotPast(slot))
      // One remaining time is still an explicit pick the owner confirms.
      setSlotId(open.length === 1 ? open[0].id : null)
      setPendingQuoteId(quoteId)
    },
    [quotes],
  )

  const confirm = useCallback(() => {
    if (!pendingQuoteId || !slotId) return
    const quoteId = pendingQuoteId
    setPendingQuoteId(null)
    void onAccept(quoteId, slotId)
  }, [onAccept, pendingQuoteId, slotId])

  const dialog = (
    <SafetyConfirmDialog
      open={pendingQuoteId != null}
      onOpenChange={(open) => {
        if (!open) setPendingQuoteId(null)
      }}
      onConfirm={confirm}
      confirmDisabled={!slotId}
      confirmLoading={
        pendingQuoteId != null && acceptingQuoteId === pendingQuoteId
      }
    >
      <Stack gap={2}>
        <Text fontWeight={500}>{q.pickSlot}</Text>
        {futureSlots.length === 0 ? (
          <Text fontSize="sm" color="status.danger.fg">
            {q.noFutureSlots}
          </Text>
        ) : (
          <>
            <Stack gap={2} role="radiogroup" aria-label={q.pickSlot}>
              {slots.map((slot) => {
                const past = isTimeSlotPast(slot)
                const label = formatTimeSlotLabel(slot, locale)
                return (
                  <RadioButton
                    key={slot.id}
                    checked={slotId === slot.id}
                    disabled={past}
                    label={past ? `${label} · ${q.pastSlot}` : label}
                    onChange={() => setSlotId(slot.id)}
                  />
                )
              })}
            </Stack>
            <Text fontSize="sm" color="text.muted">
              {q.pickSlotHint}
            </Text>
          </>
        )}
      </Stack>
    </SafetyConfirmDialog>
  )

  return { requestAccept, dialog }
}

/** Task-detail accept confirm, wired to the provider. Used by QuotesModule. */
export function useAcceptQuoteSafety() {
  const { onAcceptQuote, acceptingQuoteId, task } = useTaskDetail()
  return useAcceptQuoteDialog({
    quotes: task?.quotes ?? [],
    onAccept: onAcceptQuote,
    acceptingQuoteId,
  })
}
