'use client'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
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

import { useDashboardSearchStore } from '@/app/dashboard/store/dashboardSearchStore'
import { ME_QUERY } from '@/graphql/auth'
import { MY_TASKS_QUERY } from '@/graphql/tasks'
import type { MyTasksQueryData } from '@/graphql/tasks-query.types'
import {
  type MyOfferItem,
  type TaskItem,
  formatPounds,
  getDisplayNameFromEmail,
  isOfferAwarded,
  isTaskCompleted,
  matchesSearch,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'
import type {
  DashboardProfile,
  DashboardTrade,
  DashboardWorkerProfile,
  ServiceHistoryEntry,
} from '@/utils/dashboardTypes'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { getWorkerRegistered, setWorkerRegistered } from '@/utils/workerSession'

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

const defaultWorkerProfile = (): DashboardWorkerProfile => ({
  isActive: false,
  businessName: '',
  tagline: '',
  serviceArea: '',
  yearsExperience: '3',
  hourlyRatePence: 4500,
  skills: [],
  verificationDocumentName: '',
  joinedAt: null,
})

function toHistoryEntry(item: LiveHistoryItem): ServiceHistoryEntry {
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
  serviceHistory: ServiceHistoryEntry[]
  workerServiceHistory: ServiceHistoryEntry[]
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
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(
  null,
)

type DashboardDataProviderProps = {
  children: React.ReactNode
}

export function DashboardDataProvider({
  children,
}: DashboardDataProviderProps) {
  const search = useDashboardSearchStore((s) => s.search)
  const setSearch = useDashboardSearchStore((s) => s.setSearch)
  const [profile, setProfile] = useState<DashboardProfile | null>(null)
  const [workerProfile, setWorkerProfile] = useState<DashboardWorkerProfile>(
    defaultWorkerProfile(),
  )

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
  } = useQuery<MyTasksQueryData>(MY_TASKS_QUERY, {
    fetchPolicy: 'network-only',
    skip: !me,
  })

  useEffect(() => {
    if (!me) {
      setProfile(null)
      setWorkerProfile(defaultWorkerProfile())
      return
    }

    setProfile({
      fullName: getDisplayNameFromEmail(me.email),
      bio: '',
      phoneNumber: '',
      location: '',
      preferredTrades: [],
    })

    setWorkerProfile({
      ...defaultWorkerProfile(),
      isActive: getWorkerRegistered(me.id),
    })
  }, [me])

  const tasks = tasksData?.myTasks ?? []
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
      location: taskPublicLocationLabel(task) || 'Location TBC',
      completedAt: task.createdAt,
      valuePence: task.priceOfferPence ?? 0,
      summary: 'Posted task completed and archived in your customer history.',
      role: 'customer',
    }))

    const workerItems: LiveHistoryItem[] = completedAsWorker.map(
      ({ task, offer }) => ({
        id: `worker-${offer.id}`,
        title: task.title,
        location: taskPublicLocationLabel(task) || 'Location TBC',
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
    const profileName = profile?.fullName?.trim()
    return profileName || getDisplayNameFromEmail(me?.email)
  }, [profile?.fullName, me?.email])

  const userInitial = displayName.charAt(0)?.toUpperCase() || '?'

  const workerEnabled = Boolean(
    workerProfile.isActive ||
      myOffers.length > 0 ||
      (me ? getWorkerRegistered(me.id) : false),
  )

  const serviceHistory = useMemo(
    () => completedHistoryItems.map(toHistoryEntry),
    [completedHistoryItems],
  )

  const workerServiceHistory = useMemo(
    () => serviceHistory.filter((entry) => entry.role === 'worker'),
    [serviceHistory],
  )

  const saveProfile = useCallback((next: DashboardProfile) => {
    setProfile({
      ...next,
      preferredTrades:
        next.preferredTrades.length > 0
          ? next.preferredTrades
          : ([] as DashboardTrade[]),
    })
  }, [])

  const updateProfile = useCallback((patch: Partial<DashboardProfile>) => {
    setProfile((prev) => {
      const base = prev ?? {
        fullName: '',
        bio: '',
        phoneNumber: '',
        location: '',
        preferredTrades: [] as DashboardTrade[],
      }
      return {
        ...base,
        ...patch,
        preferredTrades: (patch.preferredTrades ??
          base.preferredTrades) as DashboardTrade[],
      }
    })
  }, [])

  const registerWorker = useCallback(
    (workerInput: DashboardWorkerProfile) => {
      if (!me) return

      setWorkerRegistered(me.id, true)
      setWorkerProfile({
        ...workerInput,
        isActive: true,
        joinedAt: workerInput.joinedAt ?? new Date().toISOString(),
      })
    },
    [me],
  )

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
      profile: profile ?? {
        fullName: displayName,
        bio: '',
        phoneNumber: '',
        location: '',
        preferredTrades: [],
      },
      workerProfile,
      workerEnabled,
      serviceHistory,
      workerServiceHistory,
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
    }),
    [
      activePostedTasks,
      awardedQuotes,
      completedHistoryItems,
      customerBookings,
      displayName,
      filteredOffers,
      filteredPostedTasks,
      me,
      meErrorMessage,
      meLoading,
      myOffers,
      myPostedTasks,
      offerCountOnMyTasks,
      profile,
      quotesInProgress,
      refetchDashboardData,
      registerWorker,
      saveProfile,
      search,
      serviceHistory,
      workerServiceHistory,
      tasks,
      tasksErrorMessage,
      tasksLoading,
      tasksBootstrapping,
      totalEarningsPence,
      totalSpendPence,
      updateProfile,
      userInitial,
      workerEnabled,
      workerProfile,
      setSearch,
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
