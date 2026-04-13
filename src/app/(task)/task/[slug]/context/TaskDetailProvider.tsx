'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import type {
  AcceptQuoteMutation,
  AddQuoteMutation,
  CancelTaskMutation,
  Currency,
  MeQuery,
  TaskQuery,
} from '@codegen/schema'
import { TaskStatus } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { ME_QUERY } from '@/graphql/auth'
import {
  ACCEPT_QUOTE_MUTATION,
  ADD_QUOTE,
  CANCEL_TASK_MUTATION,
  TASK_QUERY,
} from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { priceToPence } from '@/utils/price'
import { getWorkerRegistered } from '@/utils/workerSession'

type TaskDetailRecord = NonNullable<TaskQuery['task']>

type TaskDetailContextValue = {
  task: TaskDetailRecord | null
  isOwner: boolean
  me: MeQuery['me'] | null
  isAuthenticated: boolean
  myQuote: TaskDetailRecord['quotes'][number] | null
  sortedQuotes: TaskDetailRecord['quotes']
  lowestPricePence: number | null
  quoteAmountInput: string
  quoteMessageInput: string
  setQuoteAmountInput: (v: string) => void
  setQuoteMessageInput: (v: string) => void
  quoteError: string | null
  quoteSuccess: string | null
  acceptError: string | null
  cancelError: string | null
  acceptingQuoteId: string | null
  quoting: boolean
  cancelingTask: boolean
  canAcceptQuotes: boolean
  canAccessWorkerTools: boolean
  onSubmitQuote: () => Promise<void>
  onAcceptQuote: (quoteId: string) => Promise<void>
  onCancelTask: () => Promise<void>
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
  const apollo = useApolloClient()
  const [task, setTask] = useState<TaskDetailRecord | null>(
    initialTask as TaskDetailRecord | null,
  )
  const [quoteAmountInput, setQuoteAmountInput] = useState('')
  const [quoteMessageInput, setQuoteMessageInput] = useState('')
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const isAuthenticated = Boolean(getAuthToken())

  const { data: meData } = useQuery<MeQuery>(ME_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-first',
  })
  const me = meData?.me ?? null

  const [addQuote, { loading: quoting }] =
    useMutation<AddQuoteMutation>(ADD_QUOTE)
  const [acceptQuote] = useMutation<AcceptQuoteMutation>(ACCEPT_QUOTE_MUTATION)
  const [cancelTask, { loading: cancelingTask }] =
    useMutation<CancelTaskMutation>(CANCEL_TASK_MUTATION)

  const refreshTask = useCallback(async () => {
    const result = await apollo.query<TaskQuery>({
      query: TASK_QUERY,
      variables: { id: taskId },
      fetchPolicy: 'network-only',
    })
    setTask((result.data?.task as TaskDetailRecord | null) ?? null)
  }, [apollo, taskId])

  const isOwner = useMemo(
    () =>
      Boolean(
        me &&
          task &&
          (me.id === task.createdByUserId || me.id === task.poster?.id),
      ),
    [me, task],
  )

  const myQuote = useMemo(() => {
    if (!me || !task) return null
    return task.quotes.find((quote) => quote.workerUserId === me.id) ?? null
  }, [me, task])

  const workerOnboardingDone = Boolean(me && getWorkerRegistered(me.id))
  const isAssignedWorker = Boolean(me && task && task.workerUserId === me.id)

  const sortedQuotes = useMemo(() => {
    if (!task) return []
    if (!isOwner) return [...task.quotes]
    return [...task.quotes].sort(
      (a, b) => (priceToPence(a.price) ?? 0) - (priceToPence(b.price) ?? 0),
    )
  }, [isOwner, task])

  const lowestPricePence = useMemo(() => {
    if (!isOwner || sortedQuotes.length === 0) return null
    for (const quote of sortedQuotes) {
      const pence = priceToPence(quote.price)
      if (pence != null) return pence
    }
    return null
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
      return
    }

    if (!isAuthenticated) {
      const next = `/task/${task.id}#task-quote`
      router.push(`/login?next=${encodeURIComponent(next)}`)
      return
    }

    if (!workerOnboardingDone && !myQuote) {
      setQuoteError('Create a worker profile before submitting quotes.')
      router.push('/dashboard/worker/register')
      return
    }

    try {
      const result = await addQuote({
        variables: {
          input: {
            taskId: task.id,
            price: {
              amount: (Number(quoteAmountInput) || 0) / 100,
              currency: 'GDP' as Currency,
            },
            message: quoteMessageInput || undefined,
          },
        },
      })

      if (!result.data?.addQuote?.id) {
        throw new Error('Quote submission failed. Please try again.')
      }

      setQuoteSuccess('Quote submitted successfully.')
      await refreshTask()
    } catch (error: unknown) {
      setQuoteError(getFriendlyErrorMessage(error, 'Quote submission failed.'))
    }
  }, [
    addQuote,
    isAuthenticated,
    myQuote,
    quoteAmountInput,
    quoteMessageInput,
    refreshTask,
    router,
    task,
    workerOnboardingDone,
  ])

  const onAcceptQuote = useCallback(
    async (quoteId: string) => {
      if (!task || !isOwner) return

      setAcceptError(null)
      setAcceptingQuoteId(quoteId)

      try {
        const result = await acceptQuote({
          variables: { quoteId },
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

  const value = useMemo<TaskDetailContextValue>(
    () => ({
      task,
      isOwner,
      me,
      isAuthenticated,
      myQuote,
      sortedQuotes,
      lowestPricePence,
      quoteAmountInput,
      quoteMessageInput,
      setQuoteAmountInput,
      setQuoteMessageInput,
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
      myQuote,
      onAcceptQuote,
      onCancelTask,
      onSubmitQuote,
      quoteAmountInput,
      quoteError,
      quoteMessageInput,
      quoteSuccess,
      quoting,
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
