'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useAccountOrders } from '@/app/(dashboard)/helpers/useAccountOrders'
import { useMyQuotes } from '@/app/(dashboard)/helpers/useMyQuotes'
import { useMyRequests } from '@/app/(dashboard)/helpers/useMyRequests'
import { taskDetailHrefFromMyTasks } from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { publicProfileAchievementsPath } from '@/app/helpers/publicProfilePath'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'
import { EVENTS, capture } from '@/utils/analytics'
import { buildTaskFilter } from '@/utils/taskListQuery'

import { buildMyTasksHub } from '../helpers/myTasksHub'
import {
  type MyTasksQuery,
  countHubRows,
  filterHubByRole,
  hubCategoryOptions,
  hubHasBothRoles,
  isMyTasksQueryActive,
  myTasksQueryString,
  parseMyTasksQuery,
} from '../helpers/myTasksHubFilters'
import {
  achievementRoleVisibility,
  buildAchievementPanels,
} from '../helpers/taskAchievements'
import { useMyTaskAchievements } from '../helpers/useMyTaskAchievements'
import bag from '../i11n.json'
import { MY_TASKS_VIEWS, getMyTasksView } from '../views'
import { MyTasksAchievements } from './ui/MyTasksAchievements'
import { MyTasksList } from './ui/MyTasksList'
import { MyTasksSearch } from './ui/MyTasksSearch'
import {
  type MyTasksMobileView,
  MyTasksViewSwitch,
} from './ui/MyTasksViewSwitch'

/** Typed search applies after this pause (Enter applies at once). */
const SEARCH_PAUSE_MS = 400

/**
 * My Tasks hub at `/tasks` (views/README.md): your posted tasks and quotes,
 * grouped Booked / In progress, Open, Completed. Search, Category and
 * Hosted / Quoted live in the URL (`?q=&category=&role=`) like /search.
 * Your activity sits in the desktop rail; phones switch to it in the corner.
 */
export function MyTasksScreen() {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const searchParams = useSearchParams()
  const trackedRef = useRef(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState<MyTasksQuery>(() =>
    parseMyTasksQuery(searchParams),
  )
  const queryRef = useRef(query)
  const [searchInput, setSearchInput] = useState(query.q)
  const [mobileView, setMobileView] = useState<MyTasksMobileView>('tasks')

  const applyQuery = useCallback(
    (patch: Partial<MyTasksQuery>) => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
      const next = { ...queryRef.current, ...patch }
      queryRef.current = next
      setQuery(next)
      router.replace(`${localize('/tasks')}${myTasksQueryString(next)}`, {
        scroll: false,
      })
    },
    [localize, router],
  )

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
  const filtered = isMyTasksQueryActive(query)
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
  const achievementsView = showAchievements && mobileView === 'achievements'
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

  const onOpen = useCallback(
    (taskId: string) => {
      router.push(localize(taskDetailHrefFromMyTasks(taskId)))
    },
    [localize, router],
  )

  const onSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      if (searchTimer.current) clearTimeout(searchTimer.current)
      searchTimer.current = setTimeout(() => {
        applyQuery({ q: value.trim() })
      }, SEARCH_PAUSE_MS)
    },
    [applyQuery],
  )

  const clearAll = useCallback(() => {
    setSearchInput('')
    applyQuery({ q: '', category: '', role: '' })
  }, [applyQuery])

  return (
    <AccountAuthGate>
      <Box ref={onMountRef} bg="bg.canvas" minH="100%">
        <Stack
          gap={4}
          w="full"
          maxW={PAGE_CONTAINER_MAX_W}
          mx="auto"
          px={PAGE_GUTTER_X}
          py={{ base: 4, md: 6 }}
        >
          <Stack
            direction="row"
            justify="space-between"
            align="flex-start"
            gap={3}
          >
            <Stack gap={1} minW={0}>
              <Heading as="h1" size="lg" color="text.default">
                {t.title}
              </Heading>
              <Text fontSize="sm" color="text.muted" lineHeight="1.5">
                {t.description}
              </Text>
            </Stack>
            {showAchievements ? (
              <MyTasksViewSwitch view={mobileView} onChange={setMobileView} />
            ) : null}
          </Stack>

          <Box
            display={{
              base: achievementsView ? 'none' : 'grid',
              lg: 'grid',
            }}
            gridTemplateColumns={{
              base: '1fr',
              lg: 'minmax(0, 1fr) minmax(18rem, 22rem)',
            }}
            gap={{ base: 4, lg: 6 }}
            alignItems="start"
          >
            <Stack gap={4} minW={0}>
              {config.search ? (
                <MyTasksSearch
                  value={searchInput}
                  pending={searchInput.trim() !== query.q || searchLoading}
                  onValueChange={onSearchChange}
                  onCommit={() => applyQuery({ q: searchInput.trim() })}
                  onClearSearch={() => {
                    setSearchInput('')
                    applyQuery({ q: '' })
                  }}
                  category={query.category}
                  categories={categories}
                  onCategoryChange={(category) => applyQuery({ category })}
                  role={query.role}
                  showRole={hubHasBothRoles(allSections)}
                  onRoleChange={(role) => applyQuery({ role })}
                  onClearAll={clearAll}
                />
              ) : null}
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
                onOpen={onOpen}
              />
            </Stack>
            {showAchievements ? (
              <Box
                display={{ base: 'none', lg: 'block' }}
                position="sticky"
                top={`calc(${HEADER_MIN_HEIGHT.md} + 1rem)`}
                alignSelf="start"
                zIndex={1}
              >
                <MyTasksAchievements
                  panels={panels}
                  loading={achievements.loading}
                  moreHref={moreHref}
                />
              </Box>
            ) : null}
          </Box>

          {showAchievements ? (
            <Box
              display={{
                base: achievementsView ? 'block' : 'none',
                lg: 'none',
              }}
            >
              <MyTasksAchievements
                panels={panels}
                loading={achievements.loading}
                moreHref={moreHref}
              />
            </Box>
          ) : null}
        </Stack>
      </Box>
    </AccountAuthGate>
  )
}
