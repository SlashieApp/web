'use client'

import type { MeQuery } from '@codegen/schema'
import { createContext, useContext } from 'react'

import type { OrderItem } from '@/utils/orderHelpers'

import type { TaskDetailPermissions } from '../helpers/getTaskDetailPermissions'
import type { TaskDetailRecord } from '../helpers/taskDetailUtils'

export type TaskDetailData = {
  task: TaskDetailRecord | null
  myOrder: OrderItem | null
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
  quoteAvailabilityInput: string
  setQuoteAmountInput: (v: string) => void
  setQuoteMessageInput: (v: string) => void
  setQuoteAvailabilityInput: (v: string) => void
  quoteError: string | null
  quoteSuccess: string | null
}

export type TaskDetailActions = {
  acceptError: string | null
  cancelError: string | null
  jobActionError: string | null
  verificationCode: string
  setVerificationCode: (v: string) => void
  acceptingQuoteId: string | null
  decliningQuoteId: string | null
  quoting: boolean
  cancelingTask: boolean
  completingOrderWithVerification: boolean
  onSubmitQuote: () => Promise<boolean>
  onAcceptQuote: (quoteId: string) => Promise<void>
  onDeclineQuote: (quoteId: string) => Promise<void>
  onCompleteOrderWithVerification: () => Promise<void>
  onCancelTask: () => Promise<void>
  scrollToQuoteForm: () => void
  scrollToOwnerPerformance: () => void
}

export type TaskDetailContextValue = TaskDetailData &
  TaskDetailQuoteForm &
  TaskDetailActions & {
    permissions: TaskDetailPermissions
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
