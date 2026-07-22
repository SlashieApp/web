'use client'

import { useI11n } from '@/i18n/useI11n'
import { useMutation, useQuery } from '@apollo/client/react'
import type {
  AcceptQuoteMutation,
  AddQuoteMutation,
  CancelTaskMutation,
  CompleteOrderWithVerificationMutation,
  DeclineQuoteMutation,
  MeQuery,
  TaskCoreQuery,
  TaskQuery,
} from '@codegen/schema'
import { Currency } from '@codegen/schema'
import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import bag from '../i11n.json'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { isPhoneNotVerifiedError } from '@/app/(auth)/helpers/phoneVerification'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import {
  hasUnlimitedQuoting,
  isQuoteLimitReached,
} from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import AcceptQuote from '@/app/(task)/tasks/[slug]/graphql/AcceptQuote.gql'
import AddQuote from '@/app/(task)/tasks/[slug]/graphql/AddQuote.gql'
import CancelTask from '@/app/(task)/tasks/[slug]/graphql/CancelTask.gql'
import CompleteOrderWithVerification from '@/app/(task)/tasks/[slug]/graphql/CompleteOrderWithVerification.gql'
import DeclineQuote from '@/app/(task)/tasks/[slug]/graphql/DeclineQuote.gql'
import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import { getTaskDetailPermissions } from '@/app/(task)/tasks/[slug]/helpers/getTaskDetailPermissions'
import type { TaskDetailRecord } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { taskQueryVariables } from '@/app/(task)/tasks/[slug]/helpers/taskQueryVariables'
import { isWorkerSetupComplete } from '@/app/(worker)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import Me from '@/graphql/Me.gql'
import {
  EVENTS,
  capture,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import {
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
  isWorkerQuoteLimitError,
} from '@/utils/graphqlErrors'
import { type OrderItem, isOrderClosed } from '@/utils/orderHelpers'
import { priceToPence } from '@/utils/price'

import { TaskDetailViewCapture } from '../components/TaskDetailViewCapture'
import { TaskDetailContext } from './TaskDetailContext'

const ORDER_POLL_MS = 30_000
const clientSnapshot = () => true
const serverSnapshot = () => false
const subscribeNoop = () => () => {}
/** Stable empty-quotes ref so the merged task memo doesn't churn before client data loads. */
const EMPTY_QUOTES: NonNullable<TaskQuery['task']>['quotes'] = []

type TaskDetailProviderProps = {
  taskId: string
  /** Public task meta from the auth-free SSR TaskCore query. */
  initialTask: TaskCoreQuery['task'] | null
  children: React.ReactNode
}

export function TaskDetailProvider({
  taskId,
  initialTask,
  children,
}: TaskDetailProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useI11n(bag)
  const [quoteAmountInput, setQuoteAmountInput] = useState('')
  const [quoteMessageInput, setQuoteMessageInput] = useState('')
  const [quoteAvailabilityInput, setQuoteAvailabilityInput] = useState('')
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [jobActionError, setJobActionError] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [decliningQuoteId, setDecliningQuoteId] = useState<string | null>(null)
  const isAuthenticated = Boolean(getAuthToken())
  const zustandMe = useMe()
  const getUser = useUserStore((s) => s.getUser)
  const meHydratedRef = useRef(false)

  const { data: meData, loading: meLoading } = useQuery<MeQuery>(Me, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  })
  const me = zustandMe ?? meData?.me ?? null
  const meLoadingResolved = Boolean(
    isAuthenticated && meLoading && !zustandMe && !meData?.me,
  )
  const hasWorkerRow = Boolean(me?.worker?.id)
  const hasWorkerProfile = isWorkerSetupComplete(me)
  const workerMembership = me?.worker?.membership ?? null
  const hasUnlimitedQuotes = hasUnlimitedQuoting(workerMembership)
  const quotesRemainingThisMonth =
    workerMembership?.quotesRemainingThisMonth ?? null
  const quoteLimitReached = isQuoteLimitReached(workerMembership)
  const workerBillingLoading = Boolean(
    isAuthenticated && hasWorkerRow && meLoadingResolved,
  )

  const onMembershipRefreshMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || meHydratedRef.current || !isAuthenticated) return
      meHydratedRef.current = true
      void getUser()
    },
    [getUser, isAuthenticated],
  )

  // Viewer-scoped task data + quotes: one client fetch after the public SSR
  // shell paints. Guests still receive the public quotes list; authenticated
  // viewers get orders, timeline, contact, exact address, and live status.
  // Polls while an order is live.
  const { data: clientTaskData, loading: clientTaskLoadingRaw } =
    useQuery<TaskQuery>(Task, {
      variables: taskQueryVariables(taskId),
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    })
  const clientTask = clientTaskData?.task ?? null
  const clientTaskLoading = Boolean(clientTaskLoadingRaw && !clientTask)
  const clientTaskLoaded = Boolean(clientTask)

  const liveOrder = (clientTask?.orders?.[0] ?? null) as OrderItem | null
  const shouldPollLiveOrder = Boolean(
    isAuthenticated && liveOrder && !isOrderClosed(liveOrder.status),
  )
  useQuery<TaskQuery>(Task, {
    variables: taskQueryVariables(taskId),
    skip: !shouldPollLiveOrder,
    pollInterval: ORDER_POLL_MS,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  })

  const quotes = clientTask?.quotes ?? EMPTY_QUOTES
  const quotesLoading = clientTaskLoading
  const viewerLoading = clientTaskLoading

  // Merge: public SSR meta + client Task.gql (viewer fields + quotes).
  const task = useMemo<TaskDetailRecord | null>(() => {
    if (!initialTask) return null
    return {
      ...initialTask,
      status: clientTask?.status ?? initialTask.status,
      quotes,
      timeline: clientTask?.timeline ?? [],
      orders: clientTask?.orders ?? [],
      location:
        clientTask?.location ??
        (initialTask.location
          ? { ...initialTask.location, address: null }
          : null),
      poster:
        clientTask?.poster ??
        (initialTask.poster
          ? {
              ...initialTask.poster,
              email: null,
              profile: initialTask.poster.profile
                ? { ...initialTask.poster.profile, contactNumber: null }
                : null,
            }
          : null),
    } as TaskDetailRecord
  }, [initialTask, clientTask, quotes])

  const myOrder = liveOrder
  const orderLoading = viewerLoading

  const myQuote = useMemo(() => {
    if (!me || !task) return null
    return task.quotes.find((quote) => quote.workerUserId === me.id) ?? null
  }, [me, task])

  const permissions = useMemo(
    () =>
      getTaskDetailPermissions({
        task,
        myOrder,
        me,
        myQuote,
        isAuthenticated,
      }),
    [task, myOrder, me, myQuote, isAuthenticated],
  )

  const sortedQuotes = useMemo(() => {
    if (!task) return []
    if (!permissions.isOwner) return [...task.quotes]
    return [...task.quotes].sort((a, b) => {
      const ap = priceToPence(a.price)
      const bp = priceToPence(b.price)
      if (ap == null && bp == null) return 0
      if (ap == null) return 1
      if (bp == null) return -1
      return ap - bp
    })
  }, [permissions.isOwner, task])

  const lowestPricePence = useMemo(() => {
    if (!permissions.isOwner || sortedQuotes.length === 0) return null
    let min: number | null = null
    for (const quote of sortedQuotes) {
      const pence = priceToPence(quote.price)
      if (pence == null) continue
      if (min == null || pence < min) min = pence
    }
    return min
  }, [permissions.isOwner, sortedQuotes])

  const refreshPageData = useCallback(() => {
    router.refresh()
  }, [router])

  const [addQuote, { loading: quoting }] =
    useMutation<AddQuoteMutation>(AddQuote)
  const [acceptQuote] = useMutation<AcceptQuoteMutation>(AcceptQuote)
  const [cancelTask, { loading: cancelingTask }] =
    useMutation<CancelTaskMutation>(CancelTask)
  const [declineQuote] = useMutation<DeclineQuoteMutation>(DeclineQuote)
  const [
    completeOrderWithVerification,
    { loading: completingOrderWithVerification },
  ] = useMutation<CompleteOrderWithVerificationMutation>(
    CompleteOrderWithVerification,
  )

  const onSubmitQuote = useCallback(async () => {
    setQuoteError(null)
    setQuoteSuccess(null)
    const p = t.provider

    if (!task) {
      setQuoteError(p.taskNotLoaded)
      return false
    }

    if (quotesLoading) {
      setQuoteError(p.quotesLoading)
      return false
    }

    if (!isAuthenticated) {
      const onQuoteFlow = pathname === `/tasks/${taskId}/quote`
      const next = onQuoteFlow
        ? `/tasks/${taskId}/quote`
        : `/tasks/${task.id}#task-quote`
      capture(EVENTS.login_gate, {
        route: pathname,
        gate_reason: 'send_quote',
        task_id: taskId,
      })
      router.push(`/login?next=${encodeURIComponent(next)}`)
      return false
    }

    if (!permissions.hasWorkerProfile && !myQuote) {
      setQuoteError(p.needWorkerProfile)
      const onQuoteFlow = pathname === `/tasks/${taskId}/quote`
      const next = onQuoteFlow
        ? `/tasks/${taskId}/quote`
        : `/tasks/${task.id}#task-quote`
      router.push(workerSetupHref(next))
      return false
    }

    if (!permissions.canSubmitQuote) {
      setQuoteError(p.notAcceptingQuotes)
      return false
    }

    if (me && !isEmailVerified(me)) {
      const message = p.verifyEmailBeforeQuote
      setQuoteError(message)
      showAppToast({
        title: p.emailRequiredTitle,
        description: message,
        type: 'warning',
      })
      return false
    }

    const trimmedMessage = quoteMessageInput.trim()
    const trimmedAvailability = quoteAvailabilityInput.trim()
    const messageParts = [trimmedMessage]
    if (trimmedAvailability) {
      messageParts.push(`Availability: ${trimmedAvailability}`)
    }
    const combinedMessage =
      messageParts.filter(Boolean).join('\n\n') || undefined

    try {
      const result = await addQuote({
        variables: {
          input: {
            taskId: task.id,
            price: {
              amount: (Number(quoteAmountInput) || 0) / 100,
              currency: Currency.Gbp,
            },
            message: combinedMessage,
          },
        },
        // Refetch by operation name so active `/quotes` queries refresh
        // regardless of their filter/sort variables.
        refetchQueries: ['MyQuotes'],
      })

      if (!result.data?.addQuote?.id) {
        throw new Error(p.quoteFailed)
      }

      trackFlowSucceeded(EVENTS.quote_send_success, {
        task_id: task.id,
        quote_id: result.data.addQuote.id,
      })
      setQuoteSuccess(p.quoteSentSuccess)
      showAppToast({
        title: p.quoteSentTitle,
        description: p.quoteSentSuccess,
        type: 'success',
      })
      refreshPageData()
      return true
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.quote_send_fail, error, {
        flow: 'quote_send',
        action: 'onSubmitQuote',
        operation: 'AddQuote',
        route: pathname,
        extra: { task_id: taskId },
      })
      const message = getFriendlyErrorMessage(error, p.quoteFailedShort)
      setQuoteError(message)
      const code = getGraphQLErrorCode(error)
      if (isWorkerQuoteLimitError(error)) {
        capture(EVENTS.quote_limit_reached, { task_id: task.id })
        showAppToast({
          title: p.quoteLimitTitle,
          description: message,
          type: 'warning',
        })
      } else if (
        code === 'EMAIL_NOT_VERIFIED' ||
        isPhoneNotVerifiedError(error)
      ) {
        showAppToast({
          title:
            code === 'PHONE_NOT_VERIFIED'
              ? p.phoneRequiredTitle
              : p.emailRequiredTitle,
          description: message,
          type: 'warning',
        })
      }
      return false
    }
  }, [
    addQuote,
    isAuthenticated,
    me,
    myQuote,
    pathname,
    permissions.canSubmitQuote,
    permissions.hasWorkerProfile,
    quoteAmountInput,
    quoteAvailabilityInput,
    quoteMessageInput,
    quotesLoading,
    refreshPageData,
    router,
    t.provider,
    task,
    taskId,
  ])

  const onAcceptQuote = useCallback(
    async (quoteId: string) => {
      if (!task || !permissions.showAcceptDecline) return
      const p = t.provider

      setAcceptError(null)
      setAcceptingQuoteId(quoteId)

      try {
        const result = await acceptQuote({
          variables: { input: { quoteId } },
        })
        const order = result.data?.acceptQuote?.order
        if (!order?.id) {
          throw new Error(p.acceptFailed)
        }
        showAppToast({
          title: p.quoteAcceptedTitle,
          type: 'success',
        })
        trackFlowSucceeded(EVENTS.quote_accept_success, {
          task_id: task.id,
          quote_id: quoteId,
          order_id: order.id,
        })
        refreshPageData()
        router.replace(`/tasks/${task.id}#task-order`)
      } catch (error: unknown) {
        trackFlowFailed(EVENTS.quote_accept_fail, error, {
          flow: 'quote_accept',
          action: 'onAcceptQuote',
          operation: 'AcceptQuote',
          extra: { task_id: task?.id, quote_id: quoteId },
        })
        setAcceptError(getFriendlyErrorMessage(error, p.acceptFailed))
      } finally {
        setAcceptingQuoteId(null)
      }
    },
    [
      acceptQuote,
      permissions.showAcceptDecline,
      refreshPageData,
      router,
      t.provider,
      task,
    ],
  )

  const onDeclineQuote = useCallback(
    async (quoteId: string) => {
      if (!task || !permissions.showAcceptDecline) return
      const p = t.provider
      setAcceptError(null)
      setDecliningQuoteId(quoteId)
      try {
        const result = await declineQuote({ variables: { quoteId } })
        if (!result.data?.declineQuote?.id) {
          throw new Error(p.declineFailed)
        }
        showAppToast({
          title: p.quoteDeclinedTitle,
          description: p.quoteDeclinedDescription,
          type: 'info',
        })
        trackFlowSucceeded(EVENTS.quote_decline_success, {
          task_id: task.id,
          quote_id: quoteId,
        })
        refreshPageData()
      } catch (error: unknown) {
        trackFlowFailed(EVENTS.quote_decline_fail, error, {
          flow: 'quote_decline',
          action: 'onDeclineQuote',
          operation: 'DeclineQuote',
          extra: { task_id: task?.id, quote_id: quoteId },
        })
        setAcceptError(getFriendlyErrorMessage(error, p.declineFailed))
      } finally {
        setDecliningQuoteId(null)
      }
    },
    [
      declineQuote,
      permissions.showAcceptDecline,
      refreshPageData,
      t.provider,
      task,
    ],
  )

  const onCompleteOrderWithVerification = useCallback(async () => {
    if (!myOrder || !permissions.showCompleteWithCode) return
    const p = t.provider
    const code = verificationCode.trim()
    if (code.length !== 6) {
      setJobActionError(p.enterCode)
      return
    }
    setJobActionError(null)
    try {
      const result = await completeOrderWithVerification({
        variables: { orderId: myOrder.id, code },
      })
      if (!result.data?.completeOrderWithVerification?.id) {
        throw new Error(p.completeFailed)
      }
      setVerificationCode('')
      showAppToast({
        title: p.jobClosedTitle,
        description: p.jobClosedDescription,
        type: 'success',
      })
      trackFlowSucceeded(EVENTS.job_verify_success, {
        order_id: myOrder.id,
        task_id: taskId,
      })
      refreshPageData()
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.job_verify_fail, error, {
        flow: 'job_verify_code',
        action: 'onCompleteOrderWithVerification',
        operation: 'CompleteOrderWithVerification',
        extra: { order_id: myOrder.id, task_id: taskId },
      })
      setJobActionError(getFriendlyErrorMessage(error, p.invalidCode))
    }
  }, [
    completeOrderWithVerification,
    myOrder,
    permissions.showCompleteWithCode,
    refreshPageData,
    t.provider,
    taskId,
    verificationCode,
  ])

  const onCancelTask = useCallback(async () => {
    if (!task || !permissions.canCancelTask) return
    const p = t.provider

    setCancelError(null)
    const confirmed = window.confirm(t.actions.cancelConfirm)
    if (!confirmed) return

    try {
      const result = await cancelTask({ variables: { taskId: task.id } })
      if (!result.data?.cancelTask?.id) {
        throw new Error(p.cancelFailed)
      }
      refreshPageData()
    } catch (error: unknown) {
      setCancelError(getFriendlyErrorMessage(error, p.cancelFailed))
    }
  }, [
    cancelTask,
    permissions.canCancelTask,
    refreshPageData,
    t.actions.cancelConfirm,
    t.provider,
    task,
  ])

  const scrollToQuoteForm = useCallback(() => {
    if (typeof document === 'undefined') return
    document.getElementById('task-quote')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const scrollToOwnerPerformance = useCallback(() => {
    if (typeof document === 'undefined') return
    document.getElementById('owner-task-performance')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  // State-dependent surfaces (status header copy, hero CTA, booking panel)
  // should show loading placeholders until this is true — before that the
  // permission flags are guest-shaped defaults, not the confirmed viewer state.
  const statusReady = Boolean(
    clientTaskLoaded && (!isAuthenticated || !meLoadingResolved),
  )

  const value = useMemo(
    () => ({
      permissions,
      task,
      myOrder,
      orderLoading,
      viewerLoading,
      statusReady,
      quotesLoading,
      me,
      meLoading: meLoadingResolved,
      isAuthenticated,
      myQuote,
      sortedQuotes,
      lowestPricePence,
      workerBillingLoading,
      hasUnlimitedQuotes,
      quotesRemainingThisMonth,
      quoteLimitReached,
      quoteAmountInput,
      quoteMessageInput,
      quoteAvailabilityInput,
      setQuoteAmountInput,
      setQuoteMessageInput,
      setQuoteAvailabilityInput,
      quoteError,
      quoteSuccess,
      acceptError,
      cancelError,
      jobActionError,
      verificationCode,
      setVerificationCode,
      acceptingQuoteId,
      decliningQuoteId,
      quoting,
      cancelingTask,
      completingOrderWithVerification,
      onSubmitQuote,
      onAcceptQuote,
      onDeclineQuote,
      onCompleteOrderWithVerification,
      onCancelTask,
      scrollToQuoteForm,
      scrollToOwnerPerformance,
    }),
    [
      permissions,
      task,
      myOrder,
      orderLoading,
      viewerLoading,
      statusReady,
      quotesLoading,
      me,
      meLoadingResolved,
      isAuthenticated,
      myQuote,
      sortedQuotes,
      lowestPricePence,
      workerBillingLoading,
      hasUnlimitedQuotes,
      quotesRemainingThisMonth,
      quoteLimitReached,
      quoteAmountInput,
      quoteMessageInput,
      quoteAvailabilityInput,
      quoteError,
      quoteSuccess,
      acceptError,
      cancelError,
      jobActionError,
      verificationCode,
      acceptingQuoteId,
      decliningQuoteId,
      quoting,
      cancelingTask,
      completingOrderWithVerification,
      onSubmitQuote,
      onAcceptQuote,
      onDeclineQuote,
      onCompleteOrderWithVerification,
      onCancelTask,
      scrollToQuoteForm,
      scrollToOwnerPerformance,
    ],
  )

  const isClient = useSyncExternalStore(
    subscribeNoop,
    clientSnapshot,
    serverSnapshot,
  )
  const authReadyForTaskView = !isAuthenticated || !meLoadingResolved
  const canCaptureTaskView = isClient && Boolean(task) && authReadyForTaskView

  return (
    <TaskDetailContext.Provider value={value}>
      <div ref={onMembershipRefreshMount} hidden aria-hidden />
      {canCaptureTaskView && task ? (
        <TaskDetailViewCapture
          taskId={task.id}
          taskSlug={taskId}
          isOwner={permissions.isOwner}
          hasWorkerProfile={permissions.hasWorkerProfile}
          isAuthenticated={isAuthenticated}
        />
      ) : null}
      {children}
    </TaskDetailContext.Provider>
  )
}

export { useTaskDetail, useTask } from './TaskDetailContext'
