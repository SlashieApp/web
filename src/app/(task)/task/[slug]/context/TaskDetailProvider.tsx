'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import type {
  AcceptQuoteMutation,
  AddQuoteMutation,
  CancelTaskMutation,
  MeQuery,
  TaskQuery,
} from '@codegen/schema'
import { Currency, QuoteStatus, TaskStatus } from '@codegen/schema'
import { usePathname, useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import AcceptQuote from '@/app/(task)/graphql/AcceptQuote.gql'
import AddQuote from '@/app/(task)/graphql/AddQuote.gql'
import CancelTask from '@/app/(task)/graphql/CancelTask.gql'
import Task from '@/app/(task)/graphql/Task.gql'
import Me from '@/graphql/Me.gql'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { priceToPence } from '@/utils/price'

type TaskDetailRecord = NonNullable<TaskQuery['task']>

type TaskDetailContextValue = {
  task: TaskDetailRecord | null
  isOwner: boolean
  me: MeQuery['me'] | null
  /** True while the `Me` query is in flight (only when authenticated). */
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
  acceptingQuoteId: string | null
  quoting: boolean
  cancelingTask: boolean
  canAcceptQuotes: boolean
  canAccessWorkerTools: boolean
  onSubmitQuote: () => Promise<boolean>
  onAcceptQuote: (quoteId: string) => Promise<void>
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
  const isAuthenticated = Boolean(getAuthToken())

  const { data: meData, loading: meLoading } = useQuery<MeQuery>(Me, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-first',
  })
  const me = meData?.me ?? null
  const meLoadingResolved = Boolean(isAuthenticated && meLoading)

  const [addQuote, { loading: quoting }] =
    useMutation<AddQuoteMutation>(AddQuote)
  const [acceptQuote] = useMutation<AcceptQuoteMutation>(AcceptQuote)
  const [cancelTask, { loading: cancelingTask }] =
    useMutation<CancelTaskMutation>(CancelTask)

  const refreshTask = useCallback(async () => {
    const result = await apollo.query<TaskQuery>({
      query: Task,
      variables: { id: taskId },
      fetchPolicy: 'network-only',
    })
    setTask((result.data?.task as TaskDetailRecord | null) ?? null)
  }, [apollo, taskId])

  const isOwner = useMemo(
    () => Boolean(me && task && me.id === task.poster?.id),
    [me, task],
  )

  const myQuote = useMemo(() => {
    if (!me || !task) return null
    return task.quotes.find((quote) => quote.workerUserId === me.id) ?? null
  }, [me, task])

  const workerOnboardingDone = Boolean(me?.worker?.id)
  const isAssignedWorker = Boolean(
    me &&
      task &&
      task.quotes.some(
        (q) => q.workerUserId === me.id && q.status === QuoteStatus.Accepted,
      ),
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
    isOwner && task && task.status === TaskStatus.Open,
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
        if (!result.data?.acceptQuote?.id) {
          throw new Error('Could not accept this quote.')
        }
        await refreshTask()
      } catch (error: unknown) {
        setAcceptError(
          getFriendlyErrorMessage(error, 'Could not accept this quote.'),
        )
      } finally {
        setAcceptingQuoteId(null)
      }
    },
    [acceptQuote, isOwner, refreshTask, task],
  )

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
      isOwner,
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
      acceptingQuoteId,
      quoting,
      cancelingTask,
      canAcceptQuotes,
      canAccessWorkerTools,
      onSubmitQuote,
      onAcceptQuote,
      onCancelTask,
      scrollToQuoteForm,
      scrollToOwnerPerformance,
    }),
    [
      acceptError,
      acceptingQuoteId,
      cancelError,
      cancelingTask,
      canAcceptQuotes,
      canAccessWorkerTools,
      isAuthenticated,
      isOwner,
      lowestPricePence,
      me,
      meLoadingResolved,
      myQuote,
      onAcceptQuote,
      onCancelTask,
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

/** Alias for {@link useTaskDetail} (task detail route context). */
export const useTask = useTaskDetail
