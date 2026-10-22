'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useAccountOrders } from '@/app/(dashboard)/helpers/useAccountOrders'
import { useMyQuotes } from '@/app/(dashboard)/helpers/useMyQuotes'
import { useMyRequests } from '@/app/(dashboard)/helpers/useMyRequests'
import { publicProfileAchievementsPath } from '@/app/helpers/publicProfilePath'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { EVENTS, capture } from '@/utils/analytics'
import { buildTaskFilter } from '@/utils/taskListQuery'

import { buildMyTasksHub } from '../helpers/myTasksHub'
import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
  activeFilterCount,
  countHubRows,
  filterHubByRole,
  hubCategoryOptions,
  hubHasBothRoles,
  myTasksQueryString,
  parseMyTasksQuery,
} from '../helpers/myTasksHubFilters'
import { quoteBlocker } from '../helpers/quoteBlocker'
import {
  achievementRoleVisibility,
  buildAchievementPanels,
} from '../helpers/taskAchievements'
import { useMyTaskAchievements } from '../helpers/useMyTaskAchievements'
import bag from '../i11n.json'
import { MY_TASKS_VIEWS, getMyTasksView } from '../views'
import { MyTasksAchievements } from './ui/MyTasksAchievements'
import { MyTasksFilters } from './ui/MyTasksFilters'
import { MyTasksList } from './ui/MyTasksList'
import { MyTasksQuoteBlocker } from './ui/MyTasksQuoteBlocker'
import { type MyTasksTab, MyTasksViewSwitch } from './ui/MyTasksViewSwitch'

/**
 * My Tasks hub at `/tasks` (views/README.md), like Uber's Activity screen:
 * your posted tasks and quotes in Upcoming, Open and Past, under a "Before
 * you can quote" strip when something blocks a worker from quoting. The
 * filter icon by the title opens search, Hosted / Quoted and Category, kept
 * in the URL (`?q=&category=&role=`). The list / chart toggle swaps the
 * list for Your activity. One centred column on every screen.
 */
export function MyTasksScreen() {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const searchParams = useSearchParams()
  const trackedRef = useRef(false)

  const [query, setQuery] = useState<MyTasksQuery>(() =>
    parseMyTasksQuery(searchParams),
  )
  const [tab, setTab] = useState<MyTasksTab>('tasks')

  const applyQuery = useCallback(
    (next: MyTasksQuery) => {
      setQuery(next)
      router.replace(`${localize('/tasks')}${myTasksQueryString(next)}`, {
        scroll: false,
      })
    },
    [localize, router],
  )

  const blocker = quoteBlocker(useUserStore((s) => s.me))
  const requests = useMyRequests()
  const quotes = useMyQuotes()
  const orders = useAccountOrders()
  const achievements = useMyTaskAchievements()

  const listVariables = useMemo(() => {
    const filter = buildTaskFilter({
      search: query.q,
      category: query.category,
    })
    return filter ? { filter } : undefined
  }, [query.category, query.q])
  const filteredRequests = useMyRequests(listVariables)
  const filteredQuotes = useMyQuotes(listVariables)

  const userId = requests.me?.id ?? quotes.me?.id ?? orders.me?.id
  const allSections = useMemo(
    () =>
      buildMyTasksHub({
        posted: requests.postedTasks,
        sentQuotes: quotes.sentQuotes,
        orders: orders.orders,
        userId,
      }),
    [orders.orders, quotes.sentQuotes, requests.postedTasks, userId],
  )
  const visibleSections = useMemo(() => {
    const searched = listVariables
      ? buildMyTasksHub({
          posted: filteredRequests.postedTasks,
          sentQuotes: filteredQuotes.sentQuotes,
          orders: orders.orders,
          userId,
        })
      : allSections
    return filterHubByRole(searched, query.role)
  }, [
    allSections,
    filteredQuotes.sentQuotes,
    filteredRequests.postedTasks,
    listVariables,
    orders.orders,
    query.role,
    userId,
  ])

  const hasTasks = countHubRows(allSections) > 0
  const visibleCount = countHubRows(visibleSections)
  const firstLoad =
    !hasTasks && (requests.loading || quotes.loading || orders.loading)
  const searchLoading =
    Boolean(listVariables) &&
    (filteredRequests.loading || filteredQuotes.loading)
  const errorMessage =
    requests.errorMessage ||
    quotes.errorMessage ||
    orders.errorMessage ||
    (listVariables
      ? filteredRequests.errorMessage || filteredQuotes.errorMessage
      : null)
  const filtered = activeFilterCount(query) > 0
  const config =
    MY_TASKS_VIEWS[
      getMyTasksView({
        hasTasks,
        hasMatches: visibleCount > 0,
        loading: firstLoad || searchLoading,
        failed: Boolean(errorMessage),
        filtered,
      })
    ]

  const categories = useMemo(
    () => hubCategoryOptions(achievements.hubTaskCategories),
    [achievements.hubTaskCategories],
  )
  const roles = achievementRoleVisibility({
    hasWorkerProfile: achievements.hasWorkerProfile,
    sentQuoteCount: quotes.sentQuotes.length,
    postedTaskCount: requests.postedTasks.length,
    workerHasActivity: achievements.worker?.hasActivity,
    customerHasActivity: achievements.customer?.hasActivity,
  })
  const panels = useMemo(
    () =>
      buildAchievementPanels({
        showWorker: roles.worker,
        showCustomer: roles.customer,
        worker: achievements.worker,
        customer: achievements.customer,
        quoteAllowance: achievements.quoteAllowance,
      }),
    [
      achievements.customer,
      achievements.quoteAllowance,
      achievements.worker,
      roles.customer,
      roles.worker,
    ],
  )
  const showAchievements = achievements.loading || panels.length > 0
  const achievementsShown = showAchievements && tab === 'achievements'
  const moreHref = userId ? publicProfileAchievementsPath(userId) : null

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.my_tasks_view)
  }, [])

  const onRetry = useCallback(() => {
    void requests.refetch()
    void quotes.refetch()
    void filteredRequests.refetch()
    void filteredQuotes.refetch()
    void orders.refetch()
    void achievements.refetch()
  }, [achievements, filteredQuotes, filteredRequests, orders, quotes, requests])

  const clearAll = useCallback(
    () => applyQuery(EMPTY_MY_TASKS_QUERY),
    [applyQuery],
  )

  return (
    <AccountAuthGate>
      <Box ref={onMountRef} bg="bg.canvas" minH="100%">
        <Stack
          gap={4}
          w="full"
          maxW="2xl"
          mx="auto"
          px={PAGE_GUTTER_X}
          py={{ base: 4, md: 6 }}
        >
          <Stack gap={1}>
            <HStack justify="space-between" align="center" gap={3}>
              <Heading as="h1" size="lg" color="text.default" minW={0}>
                {t.title}
              </Heading>
              <HStack gap={1} flexShrink={0}>
                {config.search && !achievementsShown ? (
                  <MyTasksFilters
                    query={query}
                    categories={categories}
                    showRole={hubHasBothRoles(allSections)}
                    onApply={applyQuery}
                  />
                ) : null}
                {showAchievements ? (
                  <MyTasksViewSwitch view={tab} onChange={setTab} />
                ) : null}
              </HStack>
            </HStack>
            <Text fontSize="sm" color="text.muted" lineHeight="1.5">
              {t.description}
            </Text>
          </Stack>

          {blocker ? <MyTasksQuoteBlocker blocker={blocker} /> : null}

          {achievementsShown ? (
            <MyTasksAchievements
              panels={panels}
              loading={achievements.loading}
              moreHref={moreHref}
            />
          ) : (
            <Stack gap={4} minW={0}>
              {config.body === 'groups' ? (
                <Text srOnly aria-live="polite">
                  {formatMessage(
                    visibleCount === 1
                      ? t.filters.resultCountOne
                      : t.filters.resultCount,
                    { count: visibleCount },
                  )}
                </Text>
              ) : null}
              <MyTasksList
                config={config}
                sections={visibleSections}
                filtered={filtered}
                errorMessage={errorMessage}
                onRetry={onRetry}
                onClearFilters={clearAll}
              />
            </Stack>
          )}
        </Stack>
      </Box>
    </AccountAuthGate>
  )
}
