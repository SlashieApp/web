'use client'

import type { MeQuery, OrderFailedReason } from '@codegen/schema'
import { createContext, useContext } from 'react'

import type { C2CReview } from '@/content/reviews/reviewModel'
import type { OrderCloseView, OrderItem } from '@/utils/orderHelpers'
import type { TimeSlotDraft } from '@/utils/timeSlots'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import type { TaskDetailPermissions } from '../helpers/getTaskDetailPermissions'
import type { TaskDetailMainCtaModel } from '../helpers/taskDetailMainCtaModel'
import type { TaskDetailTab } from '../helpers/taskDetailTabs'
import type { TaskDetailRecord } from '../helpers/taskDetailUtils'
import type { TaskDetailViewName } from '../views'

export type TaskDetailData = {
  taskId: string
  task: TaskDetailRecord | null
  /** Card view model from the listing click; read once on mount, never merged. */
  seed: TaskCardTask | null
  /**
   * Shared loading signal for every section. True until the public entity
   * has settled (loaded, empty, or error). Seeded named slots still render
   * real content while this is true.
   */
  pending: boolean
  error: Error | null
  refetch: () => void
  myOrder: OrderItem | null
  /** Done/Failed state of `myOrder`, re-evaluated at the booked start. */
  orderClose: OrderCloseView | null
  orderLoading: boolean
  /** Client Task.gql data (viewer fields + quotes) is loading. */
  viewerLoading: boolean
  /**
   * True once the viewer's state is CONFIRMED (viewer + quotes + me resolved).
   * Status-dependent UI should render loading placeholders until then.
   */
  statusReady: boolean
  /** The quotes list is part of Task.gql; true during its first client load. */
  quotesLoading: boolean
  me: MeQuery['me'] | null
  meLoading: boolean
  isAuthenticated: boolean
  myQuote: TaskDetailRecord['quotes'][number] | null
  sortedQuotes: TaskDetailRecord['quotes']
  lowestPricePence: number | null
  workerBillingLoading: boolean
  hasUnlimitedQuotes: boolean
  quotesRemainingThisMonth: number | null
  quoteLimitReached: boolean
}

export type TaskDetailQuoteForm = {
  quoteAmountInput: string
  quoteMessageInput: string
  /** 1–2 proposed times (local wall time) sent with the quote. */
  quoteSlots: TimeSlotDraft[]
  setQuoteAmountInput: (v: string) => void
  setQuoteMessageInput: (v: string) => void
  setQuoteSlots: (v: TimeSlotDraft[]) => void
  quoteError: string | null
  quoteSuccess: string | null
}

/** Mutations on the viewer's order (mutual close and booking requests). */
export type OrderAction =
  | { type: 'markDone' }
  | { type: 'markFailed'; reason: OrderFailedReason }
  | { type: 'requestReschedule'; slots: TimeSlotDraft[] }
  | { type: 'confirmReschedule'; slotId: string }
  | { type: 'declineReschedule' }
  | { type: 'cancelRescheduleRequest' }
  | { type: 'requestCancellation' }
  | { type: 'acceptCancellation' }
  | { type: 'declineCancellation' }
  | { type: 'withdrawCancellation' }

export type TaskDetailActions = {
  acceptError: string | null
  cancelError: string | null
  /** Last failed order action, shown in the booking panel. */
  jobActionError: string | null
  acceptingQuoteId: string | null
  quoting: boolean
  cancelingTask: boolean
  /** The order action in flight, if any. */
  orderActionPending: OrderAction['type'] | null
  onSubmitQuote: () => Promise<boolean>
  onAcceptQuote: (quoteId: string, selectedSlotId: string) => Promise<void>
  /** Resolves true when the order action succeeded. */
  runOrderAction: (action: OrderAction) => Promise<boolean>
  onCancelTask: () => Promise<void>
  /**
   * Reopen the task for quotes (`permissions.reopen`, BE-108), once the
   * owner confirmed. Resolves true once reopened.
   */
  onReopenTask: () => Promise<boolean>
  reopeningTask: boolean
  /**
   * Withdraw the viewer's pending quote (`permissions.canWithdrawQuote`).
   * Resolves true once withdrawn.
   */
  onWithdrawQuote: () => Promise<boolean>
  withdrawingQuote: boolean
  scrollToQuoteForm: () => void
  setActiveTab: (
    tab: TaskDetailTab,
    options?: { hash?: string; scrollId?: string },
  ) => void
}

export type TaskDetailContextValue = TaskDetailData &
  TaskDetailQuoteForm &
  TaskDetailActions & {
    permissions: TaskDetailPermissions
    /** What this viewer sees right now (see `views/README.md`). */
    view: TaskDetailViewName
    activeTab: TaskDetailTab
    /** The view's primary action. Null when it has none. */
    mainCta: TaskDetailMainCtaModel | null
    /** The task's Messages thread, or the inbox until it is known (FE-271). */
    taskThreadHref: string
    viewerHasSubmittedReview: boolean
    orderReview: {
      canSubmit: boolean
      viewerReview: C2CReview | null
      counterpartyReview: C2CReview | null
      unavailable: boolean
      loading: boolean
      refetch: () => Promise<void>
    }
  }

const TaskDetailContext = createContext<TaskDetailContextValue | null>(null)

export { TaskDetailContext }

export function useTaskDetail() {
  const context = useContext(TaskDetailContext)
  if (!context) {
    throw new Error('useTaskDetail must be used within TaskDetailProvider')
  }
  return context
}

export const useTask = useTaskDetail

export function usePending() {
  return useTaskDetail().pending
}

export function useSeed() {
  return useTaskDetail().seed
}
