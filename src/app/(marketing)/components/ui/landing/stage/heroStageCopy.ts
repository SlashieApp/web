import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { loadPageI11n } from '@/i18n/loadPageI11n'
import type { AppLocale } from '@/i18n/locales'
import safetyBag from '@/ui/SafetyNotice/i11n.json'

import type marketingBag from '../../../../i11n.json'

/** The demo's own data (`landing.heroStage`): its tasks, people and prices. */
type HeroStageData = (typeof marketingBag)['en']['landing']['heroStage']

export type HeroStageQuote = HeroStageData['tasks'][number]['pulses'][number]
export type HeroStageTask = HeroStageData['tasks'][number]

/**
 * The words on the task page the scene draws, taken from the task page's own
 * bag and the accept dialog's (`SafetyConfirmDialog`), so the demo always
 * says what the product says.
 */
export type HeroStageUi = {
  open: string
  awarded: string
  liveHeadline: string
  liveSubline: string
  quotesHeadlineOne: string
  quotesHeadlineMany: string
  quotesSubline: string
  bookedHeadline: string
  bookedSubline: string
  budget: string
  when: string
  location: string
  quotes: string
  accept: string
  bestMatch: string
  respondedJustNow: string
  yourWorker: string
  schedule: string
  agreedTotal: string
  helpHeading: string
  shareTask: string
  editTask: string
  payingSafely: string
  cancelTask: string
  reschedule: string
  cancelBooking: string
  preview: string
  message: string
  analytics: string
  views: string
  acceptTitle: string
  acceptHint: string
  pickSlot: string
  acceptQuote: string
}

export type HeroStageCopy = HeroStageData & { ui: HeroStageUi }

/**
 * The hero scene's copy for a locale: the demo's data from the marketing bag
 * and the product's words from the task page's bags. Runs on the server, so
 * only these strings reach the browser, not the task page's whole bag.
 */
export function buildHeroStageCopy(
  data: HeroStageData,
  locale: AppLocale,
): HeroStageCopy {
  const t = loadPageI11n(taskBag, locale)
  const safety = loadPageI11n(safetyBag, locale)
  return {
    ...data,
    ui: {
      open: t.statusPill.OPEN,
      awarded: t.statusPill.AWARDED,
      liveHeadline: t.summary.ownerLiveHeadline,
      liveSubline: t.summary.ownerLiveSubline,
      quotesHeadlineOne: t.summary.ownerQuotesHeadlineOne,
      quotesHeadlineMany: t.summary.ownerQuotesHeadlineMany,
      quotesSubline: t.summary.ownerQuotesSubline,
      bookedHeadline: t.summary.ownerBookedHeadline,
      bookedSubline: t.summary.ownerBookedSubline,
      budget: t.details.budget,
      when: t.details.when,
      location: t.details.location,
      quotes: t.quotes.heading,
      accept: t.quotes.card.accept,
      bestMatch: t.quotes.card.bestMatch,
      respondedJustNow: t.quotes.respondedJustNow,
      yourWorker: t.booking.yourWorker,
      schedule: t.booking.schedule,
      agreedTotal: t.order.agreedTotal,
      helpHeading: t.actions.helpHeading,
      shareTask: t.actions.shareTask,
      editTask: t.actions.editTask,
      payingSafely: t.actions.payingMeetingSafely,
      cancelTask: t.actions.cancelTask,
      reschedule: t.requests.reschedule,
      cancelBooking: t.requests.cancelBooking,
      preview: t.cta.preview,
      message: t.cta.message,
      analytics: t.analytics.heading,
      views: t.analytics.views,
      acceptTitle: safety.acceptTitle,
      acceptHint: safety.acceptHint,
      pickSlot: t.quotes.pickSlot,
      acceptQuote: safety.acceptCta,
    },
  }
}
