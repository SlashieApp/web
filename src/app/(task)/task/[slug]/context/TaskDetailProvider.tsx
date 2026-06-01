'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import type {
  AcceptQuoteMutation,
  AddQuoteMutation,
  CancelTaskMutation,
  CompleteOrderWithVerificationMutation,
  DeclineQuoteMutation,
  MeQuery,
  MyOrdersQuery,
  OrderQuery,
  TaskQuery,
} from '@codegen/schema'
import { Currency, QuoteStatus, TaskStatus } from '@codegen/schema'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import CompleteOrderWithVerification from '@/app/(dashboard)/graphql/CompleteOrderWithVerification.gql'
import DeclineQuote from '@/app/(dashboard)/graphql/DeclineQuote.gql'
import MyOrders from '@/app/(dashboard)/graphql/MyOrders.gql'
import Order from '@/app/(dashboard)/graphql/Order.gql'
import AcceptQuote from '@/app/(task)/graphql/AcceptQuote.gql'
import AddQuote from '@/app/(task)/graphql/AddQuote.gql'
import CancelTask from '@/app/(task)/graphql/CancelTask.gql'
import Task from '@/app/(task)/graphql/Task.gql'
import Me from '@/graphql/Me.gql'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { type OrderItem, findOrderForTask } from '@/utils/orderHelpers'
import { priceToPence } from '@/utils/price'
import { canSubmitNewQuote } from '@/utils/taskJobSchedule'

type TaskDetailRecord = NonNullable<TaskQuery['task']>

type TaskDetailContextValue = {
  task: TaskDetailRecord | null
  myOrder: OrderItem | null
  isOwner: boolean
  isOrderWorker: boolean
  isOrderCustomer: boolean
  isAssignedWorker: boolean
  canSubmitQuote: boolean
  me: MeQuery['me'] | null
  meLoading: boolean
  isAuthenticated: boolean
  myQuote: TaskDetailRecord['quotes'][number] | null
  sortedQuotes: TaskDetailRecord['quotes']
  lowestPricePence: number | null
  quoteAmountInput: string
  quoteMessageInput: string
  quoteAvailabilityInput: string
  setQuoteAmountInput: (v: string) => void
  setQuoteMessageInput: (v: string) => void
  setQuoteAvailabilityInput: (v: string) => void
  quoteError: string | null
  quoteSuccess: string | null
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
  canAcceptQuotes: boolean
  canAccessWorkerTools: boolean
  onSubmitQuote: () => Promise<boolean>
  onAcceptQuote: (quoteId: string) => Promise<void>
  onDeclineQuote: (quoteId: string) => Promise<void>
  onCompleteOrderWithVerification: () => Promise<void>
  onCancelTask: () => Promise<void>
  scrollToQuoteForm: () => void
  scrollToOwnerPerformance: () => void
}

const TaskDetailContext = createContext<TaskDetailContextValue | null>(null)

type TaskDetailProviderProps = {
  taskId: string
  initialTask: TaskQuery['task'] | null
  children: React.ReactNode
}

export function TaskDetailProvider({
  taskId,
  initialTask,
  children,
}: TaskDetailProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const apollo = useApolloClient()
  const [task, setTask] = useState<TaskDetailRecord | null>(
    initialTask as TaskDetailRecord | null,
  )
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

  const { data: meData, loading: meLoading } = useQuery<MeQuery>(Me, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-first',
  })
  const me = meData?.me ?? null
  const meLoadingResolved = Boolean(isAuthenticated && meLoading)

  const orderIdParam = searchParams.get('orderId')?.trim() || null

  const { data: myOrdersData, refetch: refetchMyOrders } =
    useQuery<MyOrdersQuery>(MyOrders, {
      skip: !me,
      fetchPolicy: 'cache-and-network',
    })

  const orderFromList = useMemo(() => {
    if (!me || !task) return null
    return findOrderForTask(myOrdersData?.myOrders ?? [], task.id, me.id)
  }, [me, myOrdersData?.myOrders, task])

  const resolvedOrderId = orderIdParam ?? orderFromList?.id ?? null

  const { data: orderData, refetch: refetchOrder } = useQuery<OrderQuery>(
    Order,
    {
      variables: { id: resolvedOrderId ?? '' },
      skip: !resolvedOrderId,
      fetchPolicy: 'cache-and-network',
    },
  )

  const myOrder = (orderData?.order ?? orderFromList) as OrderItem | null

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

  const refreshTask = useCallback(async () => {
    const result = await apollo.query<TaskQuery>({
      query: Task,
      variables: { id: taskId },
      fetchPolicy: 'network-only',
    })
    setTask((result.data?.task as TaskDetailRecord | null) ?? null)
  }, [apollo, taskId])

  const refreshOrders = useCallback(async () => {
    await Promise.all([
      refetchMyOrders(),
      resolvedOrderId ? refetchOrder() : Promise.resolve(),
    ])
  }, [refetchMyOrders, refetchOrder, resolvedOrderId])

  const isOwner = useMemo(
    () => Boolean(me && task && me.id === task.poster?.id),
    [me, task],
  )

  const isOrderWorker = Boolean(me && myOrder && myOrder.workerUserId === me.id)
  const isOrderCustomer = Boolean(
    me && myOrder && myOrder.customerUserId === me.id,
  )

  const myQuote = useMemo(() => {
    if (!me || !task) return null
    return task.quotes.find((quote) => quote.workerUserId === me.id) ?? null
  }, [me, task])

  const workerOnboardingDone = Boolean(me?.worker?.id)

  const isAssignedWorker = Boolean(
    isOrderWorker ||
      (me &&
        task &&
        task.quotes.some(
          (q) => q.workerUserId === me.id && q.status === QuoteStatus.Accepted,
        )),
  )

  const sortedQuotes = useMemo(() => {
    if (!task) return []
    if (!isOwner) return [...task.quotes]
    return [...task.quotes].sort((a, b) => {
      const ap = priceToPence(a.price)
      const bp = priceToPence(b.price)
      if (ap == null && bp == null) return 0
      if (ap == null) return 1
      if (bp == null) return -1
      return ap - bp
    })
  }, [isOwner, task])

  const lowestPricePence = useMemo(() => {
    if (!isOwner || sortedQuotes.length === 0) return null
    let min: number | null = null
    for (const quote of sortedQuotes) {
      const pence = priceToPence(quote.price)
      if (pence == null) continue
      if (min == null || pence < min) min = pence
    }
    return min
  }, [isOwner, sortedQuotes])

  const canAcceptQuotes = Boolean(
    isOwner && task && task.status === TaskStatus.Open && !myOrder,
  )

  const canSubmitQuote = Boolean(
    task && me && canSubmitNewQuote(task, me.id) && workerOnboardingDone,
  )

  const canAccessWorkerTools = Boolean(
    workerOnboardingDone || myQuote || isAssignedWorker,
  )

  const onSubmitQuote = useCallback(async () => {
    setQuoteError(null)
    setQuoteSuccess(null)

    if (!task) {
      setQuoteError('Task details are not loaded yet.')
      return false
    }

    if (!isAuthenticated) {
      const onQuoteFlow = pathname === `/task/${taskId}/quote`
      const next = onQuoteFlow
        ? `/task/${taskId}/quote`
        : `/task/${task.id}#task-quote`
      router.push(`/login?next=${encodeURIComponent(next)}`)
      return false
    }

    if (!workerOnboardingDone && !myQuote) {
      setQuoteError('Create a worker profile before submitting quotes.')
      router.push('/profile#profile-worker')
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
      })

      if (!result.data?.addQuote?.id) {
        throw new Error('Quote submission failed. Please try again.')
      }

      setQuoteSuccess('Quote submitted successfully.')
      showAppToast({
        title: 'Quote sent',
        description: `Your quote on “${task.title}” was submitted.`,
        type: 'success',
      })
      await refreshTask()
      return true
    } catch (error: unknown) {
      setQuoteError(getFriendlyErrorMessage(error, 'Quote submission failed.'))
      return false
    }
  }, [
    addQuote,
    isAuthenticated,
    myQuote,
    pathname,
    quoteAmountInput,
    quoteAvailabilityInput,
    quoteMessageInput,
    refreshTask,
    router,
    task,
    taskId,
    workerOnboardingDone,
  ])

  const onAcceptQuote = useCallback(
    async (quoteId: string) => {
      if (!task || !isOwner) return

      setAcceptError(null)
      setAcceptingQuoteId(quoteId)

      try {
        const result = await acceptQuote({
          variables: { input: { quoteId } },
        })
        const order = result.data?.acceptQuote?.order
        if (!order?.id) {
          throw new Error('Could not accept this quote.')
        }
        const workerName =
          task.quotes
            .find((q) => q.id === quoteId)
            ?.worker?.profile?.name?.trim() || 'Worker'
        showAppToast({
          title: 'Quote accepted',
          description: `${workerName} can now coordinate on “${task.title}”.`,
          type: 'success',
        })
        await Promise.all([refreshTask(), refreshOrders()])
        router.replace(`/task/${task.id}?orderId=${order.id}`)
      } catch (error: unknown) {
        setAcceptError(
          getFriendlyErrorMessage(error, 'Could not accept this quote.'),
        )
      } finally {
        setAcceptingQuoteId(null)
      }
    },
    [acceptQuote, isOwner, refreshOrders, refreshTask, router, task],
  )

  const onDeclineQuote = useCallback(
    async (quoteId: string) => {
      if (!task || !isOwner) return
      setAcceptError(null)
      setDecliningQuoteId(quoteId)
      try {
        const result = await declineQuote({ variables: { quoteId } })
        if (!result.data?.declineQuote?.id) {
          throw new Error('Could not decline this quote.')
        }
        showAppToast({
          title: 'Quote declined',
          description: 'The worker will be notified.',
          type: 'info',
        })
        await refreshTask()
      } catch (error: unknown) {
        setAcceptError(
          getFriendlyErrorMessage(error, 'Could not decline this quote.'),
        )
      } finally {
        setDecliningQuoteId(null)
      }
    },
    [declineQuote, isOwner, refreshTask, task],
  )

  const onCompleteOrderWithVerification = useCallback(async () => {
    if (!myOrder || !isOrderWorker) return
    const code = verificationCode.trim()
    if (code.length !== 6) {
      setJobActionError('Enter the 6-digit code from the customer.')
      return
    }
    setJobActionError(null)
    try {
      const result = await completeOrderWithVerification({
        variables: { orderId: myOrder.id, code },
      })
      if (!result.data?.completeOrderWithVerification?.id) {
        throw new Error('Could not complete this job.')
      }
      setVerificationCode('')
      showAppToast({
        title: 'Job closed',
        description:
          'Payment and completion are recorded. This order is now closed.',
        type: 'success',
      })
      await refreshOrders()
    } catch (error: unknown) {
      setJobActionError(
        getFriendlyErrorMessage(
          error,
          'Invalid or expired code. Check with the customer and try again.',
        ),
      )
    }
  }, [
    completeOrderWithVerification,
    isOrderWorker,
    myOrder,
    refreshOrders,
    verificationCode,
  ])

  const onCancelTask = useCallback(async () => {
    if (!task) return

    setCancelError(null)
    const confirmed = window.confirm(
      'Cancel this task? Professionals will no longer be able to send quotes.',
    )
    if (!confirmed) return

    try {
      const result = await cancelTask({ variables: { taskId: task.id } })
      if (!result.data?.cancelTask?.id) {
        throw new Error('Could not cancel this task.')
      }
      await refreshTask()
    } catch (error: unknown) {
      setCancelError(
        getFriendlyErrorMessage(error, 'Could not cancel this task.'),
      )
    }
  }, [cancelTask, refreshTask, task])

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

  const value = useMemo<TaskDetailContextValue>(
    () => ({
      task,
      myOrder,
      isOwner,
      isOrderWorker,
      isOrderCustomer,
      isAssignedWorker,
      canSubmitQuote,
      me,
      meLoading: meLoadingResolved,
      isAuthenticated,
      myQuote,
      sortedQuotes,
      lowestPricePence,
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
      canAcceptQuotes,
      canAccessWorkerTools,
      onSubmitQuote,
      onAcceptQuote,
      onDeclineQuote,
      onCompleteOrderWithVerification,
      onCancelTask,
      scrollToQuoteForm,
      scrollToOwnerPerformance,
    }),
    [
      acceptError,
      acceptingQuoteId,
      cancelError,
      jobActionError,
      cancelingTask,
      completingOrderWithVerification,
      canAcceptQuotes,
      canAccessWorkerTools,
      canSubmitQuote,
      decliningQuoteId,
      isAuthenticated,
      isAssignedWorker,
      isOrderCustomer,
      isOrderWorker,
      isOwner,
      lowestPricePence,
      me,
      meLoadingResolved,
      myOrder,
      myQuote,
      onAcceptQuote,
      onCancelTask,
      onCompleteOrderWithVerification,
      onDeclineQuote,
      onSubmitQuote,
      quoteAmountInput,
      quoteAvailabilityInput,
      quoteError,
      quoteMessageInput,
      quoteSuccess,
      quoting,
      scrollToOwnerPerformance,
      scrollToQuoteForm,
      sortedQuotes,
      task,
      verificationCode,
    ],
  )

  return (
    <TaskDetailContext.Provider value={value}>
      {children}
    </TaskDetailContext.Provider>
  )
}

export function useTaskDetail() {
  const context = useContext(TaskDetailContext)
  if (!context) {
    throw new Error('useTaskDetail must be used within TaskDetailProvider')
  }
  return context
}

export const useTask = useTaskDetail
