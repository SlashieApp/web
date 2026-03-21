'use client'

import { useQuery } from '@apollo/client/react'
import type { MeQuery } from '@codegen/schema'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ME_QUERY } from '@/graphql/auth'
import { TASKS_QUERY } from '@/graphql/jobs'
import type { TasksQueryData } from '@/graphql/tasks-query.types'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

import {
  type DashboardDemoState,
  type DashboardHistoryEntry,
  type DashboardMessage,
  type DashboardProfile,
  type DashboardTrade,
  type DashboardWorkerProfile,
  getDisplayNameFromEmail,
  readDashboardDemoState,
  writeDashboardDemoState,
} from './dashboardDemo'
import {
  type MyOfferItem,
  type TaskItem,
  formatPounds,
  isOfferAwarded,
  isTaskCompleted,
  matchesSearch,
  timeFromUnknown,
} from './dashboardHelpers'

type LiveHistoryItem =
  | {
      id: string
      title: string
      location: string
      completedAt: unknown
      valuePence: number
      summary: string
      role: 'customer'
    }
  | {
      id: string
      title: string
      location: string
      completedAt: unknown
      valuePence: number
      summary: string
      role: 'worker'
    }

type DashboardDataContextValue = {
  me: MeQuery['me'] | null
  meLoading: boolean
  meErrorMessage: string | null
  tasksLoading: boolean
  tasksBootstrapping: boolean
  tasksErrorMessage: string | null
  refetchDashboardData: () => void
  search: string
  setSearch: (value: string) => void
  displayName: string
  userInitial: string
  profile: DashboardProfile
  workerProfile: DashboardWorkerProfile
  workerEnabled: boolean
  messages: DashboardMessage[]
  serviceHistory: DashboardHistoryEntry[]
  tasks: TaskItem[]
  myPostedTasks: TaskItem[]
  activePostedTasks: TaskItem[]
  myOffers: MyOfferItem[]
  filteredPostedTasks: TaskItem[]
  filteredOffers: MyOfferItem[]
  quotesInProgress: MyOfferItem[]
  awardedQuotes: MyOfferItem[]
  completedHistoryItems: LiveHistoryItem[]
  customerBookings: TaskItem[]
  totalSpendPence: number
  totalEarningsPence: number
  offerCountOnMyTasks: number
  saveProfile: (profile: DashboardProfile) => void
  updateProfile: (patch: Partial<DashboardProfile>) => void
  registerWorker: (input: DashboardWorkerProfile) => void
  markAllMessagesRead: () => void
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(
  null,
)

type DashboardDataProviderProps = {
  children: React.ReactNode
}

function toHistoryEntry(item: LiveHistoryItem): DashboardHistoryEntry {
  const completedAtMs = timeFromUnknown(item.completedAt)

  return {
    id: item.id,
    title: item.title,
    location: item.location,
    completedAt:
      typeof item.completedAt === 'string'
        ? item.completedAt
        : new Date(completedAtMs || Date.now()).toISOString(),
    valuePence: item.valuePence,
    summary: item.summary,
    role: item.role,
  }
}

export function DashboardDataProvider({
  children,
}: DashboardDataProviderProps) {
  const [search, setSearch] = useState('')
  const [demoState, setDemoState] = useState<DashboardDemoState | null>(null)

  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: refetchMe,
  } = useQuery<MeQuery>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const me = meData?.me ?? null

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<TasksQueryData>(TASKS_QUERY, {
    fetchPolicy: 'network-only',
    skip: !me,
  })

  useEffect(() => {
    if (!me) {
      setDemoState(null)
      return
    }

    setDemoState(readDashboardDemoState(me.id, me.email))
  }, [me?.email, me?.id, me])

  const persistDemoState = useCallback(
    (nextState: DashboardDemoState) => {
      setDemoState(nextState)
      if (me) {
        writeDashboardDemoState(me.id, nextState)
      }
    },
    [me],
  )

  const tasks = tasksData?.tasks.items ?? []
  const tasksBootstrapping = Boolean(me && !tasksData && !tasksError)
  const meErrorMessage = meError
    ? getFriendlyErrorMessage(meError, 'Could not load account details.')
    : null
  const tasksErrorMessage = tasksError
    ? getFriendlyErrorMessage(tasksError, 'Could not load tasks.')
    : null

  const { myPostedTasks, myOffers, offerCountOnMyTasks } = useMemo(() => {
    if (!me) {
      return {
        myPostedTasks: [] as TaskItem[],
        myOffers: [] as MyOfferItem[],
        offerCountOnMyTasks: 0,
      }
    }

    const posted = tasks
      .filter((task) => task.createdByUserId === me.id)
      .sort(
        (a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt),
      )

    const submitted = tasks
      .flatMap((task) =>
        task.offers
          .filter((offer) => offer.workerUserId === me.id)
          .map((offer) => ({ task, offer })),
      )
      .sort(
        (a, b) =>
          timeFromUnknown(b.offer.createdAt) -
          timeFromUnknown(a.offer.createdAt),
      )

    const offerCount = posted.reduce(
      (count, task) => count + task.offers.length,
      0,
    )

    return {
      myPostedTasks: posted,
      myOffers: submitted,
      offerCountOnMyTasks: offerCount,
    }
  }, [tasks, me])

  const activePostedTasks = useMemo(
    () => myPostedTasks.filter((task) => !isTaskCompleted(task.status)),
    [myPostedTasks],
  )

  const filteredPostedTasks = useMemo(
    () => activePostedTasks.filter((task) => matchesSearch(task, search)),
    [activePostedTasks, search],
  )

  const filteredOffers = useMemo(
    () => myOffers.filter(({ task }) => matchesSearch(task, search)),
    [myOffers, search],
  )

  const quotesInProgress = useMemo(
    () =>
      myOffers.filter(({ task }) => !isTaskCompleted(task.status)).slice(0, 4),
    [myOffers],
  )

  const awardedQuotes = useMemo(
    () => myOffers.filter(({ offer }) => isOfferAwarded(offer.status)),
    [myOffers],
  )

  const completedAsPoster = useMemo(
    () => myPostedTasks.filter((task) => isTaskCompleted(task.status)),
    [myPostedTasks],
  )

  const completedAsWorker = useMemo(
    () => myOffers.filter(({ task }) => isTaskCompleted(task.status)),
    [myOffers],
  )

  const completedHistoryItems = useMemo<LiveHistoryItem[]>(() => {
    const posterItems: LiveHistoryItem[] = completedAsPoster.map((task) => ({
      id: `poster-${task.id}`,
      title: task.title,
      location: task.location ?? 'Location TBC',
      completedAt: task.createdAt,
      valuePence: task.priceOfferPence ?? 0,
      summary: 'Posted job completed and archived in your customer history.',
      role: 'customer',
    }))

    const workerItems: LiveHistoryItem[] = completedAsWorker.map(
      ({ task, offer }) => ({
        id: `worker-${offer.id}`,
        title: task.title,
        location: task.location ?? 'Location TBC',
        completedAt: offer.createdAt,
        valuePence: offer.pricePence,
        summary: 'Quote progressed to a completed worker engagement.',
        role: 'worker',
      }),
    )

    return [...posterItems, ...workerItems].sort(
      (a, b) => timeFromUnknown(b.completedAt) - timeFromUnknown(a.completedAt),
    )
  }, [completedAsPoster, completedAsWorker])

  const customerBookings = useMemo(
    () =>
      activePostedTasks
        .filter((task) => task.offers.length > 0)
        .sort(
          (a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt),
        ),
    [activePostedTasks],
  )

  const totalSpendPence = useMemo(
    () =>
      completedAsPoster.reduce(
        (sum, task) => sum + (task.priceOfferPence ?? 0),
        0,
      ),
    [completedAsPoster],
  )

  const totalEarningsPence = useMemo(
    () =>
      awardedQuotes.reduce(
        (sum, { offer }) => sum + (offer.pricePence ?? 0),
        0,
      ),
    [awardedQuotes],
  )

  const displayName = useMemo(() => {
    const profileName = demoState?.profile.fullName?.trim()
    return profileName || getDisplayNameFromEmail(me?.email)
  }, [demoState?.profile.fullName, me?.email])

  const userInitial = displayName.charAt(0)?.toUpperCase() || '?'

  const workerEnabled = Boolean(
    demoState?.worker.isActive || myOffers.length > 0,
  )

  const serviceHistory = useMemo(() => {
    const liveEntries = completedHistoryItems.map(toHistoryEntry)
    const demoEntries = demoState?.history ?? []

    const combined = [...liveEntries, ...demoEntries]
      .sort(
        (a, b) =>
          timeFromUnknown(b.completedAt) - timeFromUnknown(a.completedAt),
      )
      .slice(0, 8)

    return combined
  }, [completedHistoryItems, demoState?.history])

  const saveProfile = useCallback(
    (profile: DashboardProfile) => {
      if (!demoState) return
      persistDemoState({
        ...demoState,
        profile: {
          ...profile,
          preferredTrades:
            profile.preferredTrades.length > 0
              ? profile.preferredTrades
              : demoState.profile.preferredTrades,
        },
      })
    },
    [demoState, persistDemoState],
  )

  const updateProfile = useCallback(
    (patch: Partial<DashboardProfile>) => {
      if (!demoState) return
      persistDemoState({
        ...demoState,
        profile: {
          ...demoState.profile,
          ...patch,
          preferredTrades: (patch.preferredTrades ??
            demoState.profile.preferredTrades) as DashboardTrade[],
        },
      })
    },
    [demoState, persistDemoState],
  )

  const registerWorker = useCallback(
    (workerInput: DashboardWorkerProfile) => {
      if (!demoState) return

      persistDemoState({
        ...demoState,
        worker: {
          ...workerInput,
          isActive: true,
          joinedAt: workerInput.joinedAt ?? new Date().toISOString(),
        },
        messages: [
          {
            id: `worker-welcome-${Date.now()}`,
            counterpart: 'Worker Success Team',
            taskTitle: 'Worker profile',
            preview:
              'Your worker profile is live. Start sending quotes and track payouts from your dashboard.',
            updatedAt: new Date().toISOString(),
            unread: true,
          },
          ...demoState.messages,
        ].slice(0, 6),
      })
    },
    [demoState, persistDemoState],
  )

  const markAllMessagesRead = useCallback(() => {
    if (!demoState) return

    persistDemoState({
      ...demoState,
      messages: demoState.messages.map((message) => ({
        ...message,
        unread: false,
      })),
    })
  }, [demoState, persistDemoState])

  const refetchDashboardData = useCallback(() => {
    void refetchMe()
    if (me) {
      void refetchTasks()
    }
  }, [me, refetchMe, refetchTasks])

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      me,
      meLoading,
      meErrorMessage,
      tasksLoading,
      tasksBootstrapping,
      tasksErrorMessage,
      refetchDashboardData,
      search,
      setSearch,
      displayName,
      userInitial,
      profile: demoState?.profile ?? {
        fullName: displayName,
        bio: '',
        phoneNumber: '',
        location: '',
        preferredTrades: [],
      },
      workerProfile: demoState?.worker ?? {
        isActive: false,
        businessName: '',
        tagline: '',
        serviceArea: '',
        yearsExperience: '3',
        hourlyRatePence: 4500,
        skills: [],
        verificationDocumentName: '',
        joinedAt: null,
      },
      workerEnabled,
      messages: demoState?.messages ?? [],
      serviceHistory,
      tasks,
      myPostedTasks,
      activePostedTasks,
      myOffers,
      filteredPostedTasks,
      filteredOffers,
      quotesInProgress,
      awardedQuotes,
      completedHistoryItems,
      customerBookings,
      totalSpendPence,
      totalEarningsPence,
      offerCountOnMyTasks,
      saveProfile,
      updateProfile,
      registerWorker,
      markAllMessagesRead,
    }),
    [
      activePostedTasks,
      awardedQuotes,
      completedHistoryItems,
      customerBookings,
      demoState?.messages,
      demoState?.profile,
      demoState?.worker,
      displayName,
      filteredOffers,
      filteredPostedTasks,
      markAllMessagesRead,
      me,
      meErrorMessage,
      meLoading,
      myOffers,
      myPostedTasks,
      offerCountOnMyTasks,
      quotesInProgress,
      refetchDashboardData,
      registerWorker,
      saveProfile,
      search,
      serviceHistory,
      tasks,
      tasksErrorMessage,
      tasksLoading,
      tasksBootstrapping,
      totalEarningsPence,
      totalSpendPence,
      updateProfile,
      userInitial,
      workerEnabled,
    ],
  )

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error(
      'useDashboardData must be used inside DashboardDataProvider.',
    )
  }

  return context
}

export function buildEarningsHeadline(totalEarningsPence: number) {
  return totalEarningsPence > 0
    ? formatPounds(totalEarningsPence)
    : 'Awaiting first payout'
}
