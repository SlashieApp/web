'use client'

import { Grid, Stack, Text } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'

import { Button, Link } from '@ui'

import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'
import { MembershipRefreshOnMount } from '@/app/(dashboard)/components/MembershipRefreshOnMount'
import { usePageI11n } from '@/i18n/usePageI11n'
import { isQuoteAwarded } from '@/utils/dashboardHelpers'
import { useAccountOrders } from '../helpers/useAccountOrders'
import { useMyQuotes } from '../helpers/useMyQuotes'
import { useMyRequests } from '../helpers/useMyRequests'

import { DashboardMembershipPanel } from './components/DashboardMembershipPanel'
import { DashboardQuickActions } from './components/DashboardQuickActions'
import { DashboardRecentActivity } from './components/DashboardRecentActivity'
import { DashboardStatTiles } from './components/DashboardStatTiles'
import { DashboardUpcomingJobs } from './components/DashboardUpcomingJobs'
import {
  buildQuickActions,
  buildUpcomingJobs,
  displayNameFromMe,
  greetingForNow,
} from './helpers/dashboardOverview'
import bag from './i11n.json'

/**
 * Dashboard overview orchestration.
 *
 * Data: useMyRequests (posted tasks) · useMyQuotes (sent quotes) · useAccountOrders (jobs/earnings)
 * Side effects: MembershipRefreshOnMount
 * Sections: stats → upcoming jobs → activity + membership → quick actions
 */
export default function DashboardOverviewPage() {
  const t = usePageI11n(bag)
  const me = useUserStore((s) => s.me)

  const {
    loading,
    errorMessage,
    postedTasks,
    activePostedTasks,
    refetch: refetchRequests,
  } = useMyRequests()

  const {
    loading: quotesLoading,
    errorMessage: quotesErrorMessage,
    sentQuotes,
    refetch: refetchQuotes,
  } = useMyQuotes()

  const {
    loading: ordersLoading,
    errorMessage: ordersErrorMessage,
    activeOrders,
    openOrdersCount,
    pendingEarningsPence,
    closedOrdersCount,
    refetch: refetchOrders,
  } = useAccountOrders()

  const loadingAny = loading || quotesLoading || ordersLoading
  const errorMessageCombined =
    errorMessage || quotesErrorMessage || ordersErrorMessage || null

  const handleRetry = useCallback(() => {
    void refetchRequests()
    void refetchQuotes()
    void refetchOrders()
  }, [refetchOrders, refetchQuotes, refetchRequests])

  const postedAwaitingQuotes = activePostedTasks.filter(
    (task) => (task.quotes?.length ?? 0) === 0,
  ).length
  const quotesAwaitingResponse = sentQuotes.filter(
    ({ quote }) => !isQuoteAwarded(quote.status),
  ).length

  const upcomingJobs = useMemo(
    () => buildUpcomingJobs(activeOrders, me?.id),
    [activeOrders, me?.id],
  )
  const quickActions = useMemo(
    () => buildQuickActions(Boolean(me?.worker?.id)),
    [me?.worker?.id],
  )

  return (
    <>
      <MembershipRefreshOnMount />
      <DashboardPageLayout
        eyebrow={t.eyebrow}
        title={`${greetingForNow()}, ${displayNameFromMe(me)}`}
        description={t.description}
        actions={
          <>
            <Link href="/tasks" _hover={{ textDecoration: 'none' }}>
              <Button size="sm" variant="secondary">
                {t.browseTasks}
              </Button>
            </Link>
            <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
              <Button size="sm">{t.postTask}</Button>
            </Link>
          </>
        }
        afterNav={
          errorMessageCombined ? (
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'stretch', sm: 'center' }}
              gap={2}
              role="alert"
            >
              <Text color="status.danger.fg" fontSize="sm" flex={1}>
                {errorMessageCombined}
              </Text>
              <Button size="sm" variant="secondary" onClick={handleRetry}>
                {t.retry}
              </Button>
            </Stack>
          ) : null
        }
      >
        <Stack gap={4}>
          <DashboardStatTiles
            loading={loadingAny}
            postedCount={postedTasks.length}
            openPostedCount={activePostedTasks.length}
            awaitingQuotesCount={postedAwaitingQuotes}
            quotesSentCount={sentQuotes.length}
            quotesAwaitingResponseCount={quotesAwaitingResponse}
            openOrdersCount={openOrdersCount}
            pendingEarningsPence={pendingEarningsPence}
            closedOrdersCount={closedOrdersCount}
          />

          <DashboardUpcomingJobs jobs={upcomingJobs} />

          <Grid templateColumns={{ base: '1fr', xl: '1.3fr 1fr' }} gap={4}>
            <DashboardRecentActivity
              postedTasks={postedTasks}
              sentQuotes={sentQuotes}
            />
            <DashboardMembershipPanel membership={me?.worker?.membership} />
          </Grid>

          <DashboardQuickActions actions={quickActions} />
        </Stack>
      </DashboardPageLayout>
    </>
  )
}
