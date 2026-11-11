import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'
import threadCopy from '@/app/(messages)/messages/i11n.json'
import quoteFlowCopy from '@/app/(stepflow)/tasks/[slug]/quote/i11n.json'
import reviewFlowCopy from '@/app/(stepflow)/tasks/[slug]/review/i11n.json'
import createFlowCopy from '@/app/(stepflow)/tasks/create/i11n.json'
import taskCopy from '@/app/(task)/tasks/[slug]/i11n.json'
import reviewFormCopy from '@/ui/ReviewForm/i11n.json'
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

    it(`post (${locale}): the Post a task flow and the page it lands on`, () => {
      const create = createFlowCopy[locale]
      const f = phone.post.flow
      expect(f.header).toBe(create.eyebrow)
      expect(f.progress).toBe(create.progress)
      expect(f.continue).toBe(create.continue)
      expect(f.submit).toBe(create.post)
      for (const step of ['details', 'timing', 'budget', 'review'] as const) {
        expect(f.steps[step]).toEqual({
          label: create.steps[step].label,
          title: create.steps[step].title,
          description: create.steps[step].description,
        })
      }
      expect(f.titleLabel).toBe(create.fields.title)
      expect(f.categoriesLabel).toBe(create.fields.categories)
      expect(f.whenLabel).toBe(create.fields.when)
      expect(f.whenFlexible).toBe(create.fields.flexible)
      expect(f.whenBefore).toBe(create.fields.before)
      expect(f.whenExact).toBe(create.fields.exact)
      expect(f.budgetTypeLabel).toBe(create.fields.budgetType)
      expect(f.budgetOneOff).toBe(create.fields.oneOff)
      expect(f.budgetPerHour).toBe(create.fields.perHour)
      expect(f.paymentLabel).toBe(create.fields.payment)
      expect(f.paymentCash).toBe(create.fields.cash)
      expect(f.summaryTask).toBe(create.summary.task)
      expect(f.summaryArea).toBe(create.summary.area)
      expect(f.summaryWhen).toBe(create.summary.when)
      expect(f.summaryBudget).toBe(create.summary.budget)
      expect(f.open).toBe(task.statusPill.OPEN)
      expect(f.liveHeadline).toBe(task.summary.ownerLiveHeadline)
      expect(f.liveSubline).toBe(task.summary.ownerLiveSubline)
      expect(f.detailBudget).toBe(task.details.budget)
      expect(f.detailWhen).toBe(task.details.when)
      expect(f.detailLocation).toBe(task.details.location)
      expect(f.preview).toBe(task.cta.preview)
    })

    it(`send a quote (${locale}): the quote flow and the page it lands on`, () => {
      const quote = quoteFlowCopy[locale]
      const f = phone.worker.flow
      expect(f.header).toBe(quote.title)
      expect(f.progress).toBe(quote.progress)
      expect(f.continue).toBe(quote.continue)
      expect(f.submit).toBe(quote.submit)
      expect(f.backToTask).toBe(quote.gate.backToTask)
      const pick = (step: {
        label: string
        title: string
        description: string
      }) => ({
        label: step.label,
        title: step.title,
        description: step.description,
      })
      expect(f.steps.price).toEqual(pick(quote.steps['quote.price']))
      expect(f.steps.times).toEqual(pick(quote.steps['quote.availability']))
      expect(f.steps.review).toEqual(pick(quote.steps['review.check']))
      expect(f.priceLabel).toBe(quote.price.label)
      expect(f.priceHelper).toBe(quote.price.helperWithBudget)
      expect(f.proposedTimes).toBe(quote.proposedTimes)
      expect(f.messageLabel).toBe(quote.message.label)
      expect(f.open).toBe(task.statusPill.OPEN)
      expect(f.sentHeadline).toBe(task.summary.quoteSentHeadline)
      expect(f.sentSubline).toBe(task.summary.quoteSentSubline)
      expect(f.yourQuote).toBe(task.cta.yourQuote)
      expect(f.editQuote).toBe(task.cta.editQuote)
    })

    it(`review (${locale}): the review flow and the page it lands on`, () => {
      const review = reviewFlowCopy[locale]
      const form = reviewFormCopy[locale]
      const f = phone.review.flow
      expect(f.header).toBe(review.eyebrow)
      expect(f.progress).toBe(review.progress)
      expect(f.continue).toBe(review.continue)
      expect(f.submit).toBe(review.submit)
      expect(f.steps).toEqual({
        stars: review.steps.stars,
        comment: review.steps.comment,
        submit: review.steps.submit,
      })
      expect(f.starsTitle).toBe(review.starsTitle)
      expect(f.starsDescription).toBe(review.starsDescription)
      expect(f.ratingLabel).toBe(form.starsLabel)
      expect(f.starsHint).toBe(form.starsHint)
      expect(f.commentTitle).toBe(review.commentTitle)
      expect(f.commentDescription).toBe(review.commentDescription)
      expect(f.commentLabel).toBe(form.commentLabel)
      expect(f.submitTitle).toBe(review.submitTitle)
      expect(f.submitDescription).toBe(review.submitDescription)
      expect(f.completed).toBe(task.statusPill.COMPLETED)
      expect(f.completedHeadline).toBe(task.summary.completedHeadline)
      expect(f.completedSubline).toBe(task.summary.completedSubline)
      expect(f.yours).toBe(task.reviews.yours)
      expect(f.edit).toBe(task.reviews.edit)
    })
  }
})
