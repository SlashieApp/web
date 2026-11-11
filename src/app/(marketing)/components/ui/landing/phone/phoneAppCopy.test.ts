import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'
import threadCopy from '@/app/(messages)/messages/i11n.json'
import taskCopy from '@/app/(task)/tasks/[slug]/i11n.json'
import safetyCopy from '@/ui/SafetyNotice/i11n.json'

/**
 * The phone demos are replicas of the app's screens, so the labels the app
 * itself draws (not the demo's fictional people and tasks) are the app's own
 * words. These tests fail when a screen's copy changes and the demo did not.
 */
describe('the phone demos use the app’s own labels', () => {
  for (const locale of ['en', 'zh_hk'] as const) {
    const phone = messages[locale].landing.phone
    const task = taskCopy[locale]
    const safety = safetyCopy[locale]

    it(`chat (${locale}): the message box and Send are the thread's`, () => {
      expect(phone.chat.composer).toBe(threadCopy[locale].composerPlaceholder)
      expect(phone.chat.send).toBe(threadCopy[locale].send)
      expect(phone.chat.today).toBe(threadCopy[locale].today)
    })

    it(`quotes (${locale}): the task page's quote list`, () => {
      expect(phone.quotes.heading).toBe(task.quotes.heading)
      expect(phone.quotes.accept).toBe(task.quotes.card.accept)
      expect(phone.quotes.bestMatch).toBe(task.quotes.card.bestMatch)
      expect(phone.quotes.responded).toBe(task.quotes.respondedJustNow)
      expect(phone.quotes.preview).toBe(task.cta.preview)
      // The same banner as the hero scene's.
      expect(phone.quotes.sentQuote).toBe(
        messages[locale].landing.heroStage.sentQuote,
      )
    })

    it(`hire (${locale}): the accept sheet and the booked page`, () => {
      expect(phone.hire.acceptTitle).toBe(safety.acceptTitle)
      expect(phone.hire.acceptHint).toBe(safety.acceptHint)
      expect(phone.hire.acceptCta).toBe(safety.acceptCta)
      expect(phone.hire.pickSlot).toBe(task.quotes.pickSlot)
      expect(phone.hire.awarded).toBe(task.statusPill.AWARDED)
      expect(phone.hire.bookedHeadline).toBe(task.summary.ownerBookedHeadline)
      expect(phone.hire.bookedSubline).toBe(task.summary.ownerBookedSubline)
      expect(phone.hire.yourWorker).toBe(task.booking.yourWorker)
      expect(phone.hire.message).toBe(task.cta.message)
      expect(phone.hire.schedule).toBe(task.booking.schedule)
      expect(phone.hire.agreedTotal).toBe(task.order.agreedTotal)
      // The booked time is the best quote's own.
      expect(phone.hire.slot).toBe(phone.quotes.items[0].slot)
    })
  }
})
