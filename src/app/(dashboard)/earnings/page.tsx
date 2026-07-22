'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { LuCircleCheck, LuClock3, LuInfo, LuWallet } from 'react-icons/lu'

import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'
import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'
import { useI11n } from '@/i18n/useI11n'
import { formatDate, formatPounds } from '@/utils/dashboardHelpers'
import {
  formatOrderAgreedPrice,
  orderStatusChipLabel,
  orderTaskHref,
} from '@/utils/orderHelpers'
import { Badge, Card, Link } from '@ui'

import { useAccountOrders } from '../helpers/useAccountOrders'
import bag from './i11n.json'

/**
 * Reference-only earnings log. Slashie does not handle payouts; this page only
 * tallies order amounts for your records.
 */
export default function EarningsPage() {
  const t = useI11n(bag)
  const {
    loading,
    errorMessage,
    pendingEarningsPence,
    completedEarningsPence,
    pendingWorkerOrders,
    closedWorkerOrders,
  } = useAccountOrders()
  const sectionLinks = [
    { label: t.navOverview, href: '#overview' },
    { label: t.navPending, href: '#pending' },
    { label: t.navClosed, href: '#closed' },
  ] as const

  return (
    <DashboardPageLayout
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
      sections={sectionLinks}
      afterNav={
        errorMessage ? (
          <Text color="status.danger.fg" fontSize="sm">
            {errorMessage}
          </Text>
        ) : null
      }
      sidebarOnMobile={false}
      sidebar={
        <>
          <SummaryStatCard
            label={t.pendingLabel}
            value={loading ? '…' : formatPounds(pendingEarningsPence)}
            hint={t.pendingHint}
            icon={<LuClock3 size={18} aria-hidden />}
          />
          <SummaryStatCard
            label={t.completedLabel}
            value={loading ? '…' : formatPounds(completedEarningsPence)}
            hint={t.completedHint}
            icon={<LuCircleCheck size={18} aria-hidden />}
          />
          <DashboardSectionCard
            title={t.referenceTitle}
            description={t.referenceDescription}
            icon={<LuInfo size={18} aria-hidden />}
          >
            <Stack gap={3}>
              <Text fontSize="sm" color="text.muted" lineHeight="tall">
                {t.referenceBody}
              </Text>
              <Link
                href={'/billing'}
                fontSize="sm"
                fontWeight={600}
                color="text.link"
              >
                {t.platformBilling}
              </Link>
            </Stack>
          </DashboardSectionCard>
        </>
      }
    >
      <Box display={{ base: 'grid', lg: 'none' }}>
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={4}>
          <SummaryStatCard
            label={t.pendingLabel}
            value={loading ? '…' : formatPounds(pendingEarningsPence)}
            hint={t.pendingMobileHint}
            icon={<LuClock3 size={18} aria-hidden />}
          />
          <SummaryStatCard
            label={t.completedLabel}
            value={loading ? '…' : formatPounds(completedEarningsPence)}
            hint={t.completedMobileHint}
            icon={<LuCircleCheck size={18} aria-hidden />}
          />
        </Grid>
      </Box>

      <Stack gap={3} id="pending" scrollMarginTop="96px">
        <HStack gap={2}>
          <LuClock3 size={18} aria-hidden />
          <Heading as="h2" fontSize="md" fontWeight={600}>
            {t.pendingOrders}
          </Heading>
        </HStack>
        {pendingWorkerOrders.length === 0 ? (
          <DashboardSectionCard
            title={t.emptyTitle}
            description={t.emptyDescription}
          >
            <Text fontSize="sm" color="text.muted">
              {t.emptyBody}
            </Text>
          </DashboardSectionCard>
        ) : (
          <Stack gap={3}>
            {pendingWorkerOrders.map((order) => (
              <OrderEarningsCard
                key={order.id}
                title={order.snapshot.title}
                meta={orderStatusChipLabel(order.status)}
                amount={formatOrderAgreedPrice(order)}
                href={orderTaskHref(order)}
                badge={<Badge variant="success">{t.workerBadge}</Badge>}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <Stack gap={3} id="closed" scrollMarginTop="96px">
        <HStack gap={2}>
          <LuCircleCheck size={18} aria-hidden />
          <Heading as="h2" fontSize="md" fontWeight={600}>
            {t.closedOrders}
          </Heading>
        </HStack>
        {closedWorkerOrders.length === 0 ? (
          <DashboardSectionCard
            title={t.closedEmptyTitle}
            description={t.closedEmptyDescription}
          >
            <Text fontSize="sm" color="text.muted">
              {t.closedEmptyBody}
            </Text>
          </DashboardSectionCard>
        ) : (
          <Stack gap={3}>
            {closedWorkerOrders.map((order) => (
              <OrderEarningsCard
                key={order.id}
                title={order.snapshot.title}
                meta={`Closed ${order.closedAt ? formatDate(order.closedAt) : '—'}`}
                amount={formatOrderAgreedPrice(order)}
                href={orderTaskHref(order)}
                badge={<Badge variant="info">{t.closedBadge}</Badge>}
                linkLabel={t.openTask}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </DashboardPageLayout>
  )
}

function SummaryStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
}) {
  return (
    <DashboardSectionCard
      title={label}
      description={hint}
      icon={icon ?? <LuWallet size={18} aria-hidden />}
    >
      <Heading as="p" size="lg" letterSpacing="-0.02em">
        {value}
      </Heading>
    </DashboardSectionCard>
  )
}

function OrderEarningsCard({
  title,
  meta,
  amount,
  href: path,
  badge,
  linkLabel = 'Open',
}: {
  title: string
  meta: string
  amount: string
  href: string
  badge: React.ReactNode
  linkLabel?: string
}) {
  return (
    <Link href={path} _hover={{ textDecoration: 'none' }}>
      <Card layout="section" p={{ base: 4, md: 5 }}>
        <HStack
          justify="space-between"
          align="flex-start"
          flexWrap="wrap"
          gap={4}
        >
          <Stack gap={1} maxW="3xl" minW={0}>
            <Heading as="h3" size="sm">
              {title}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {meta}
            </Text>
          </Stack>
          <HStack gap={3} flexShrink={0}>
            {badge}
            <Text fontWeight={800}>{amount}</Text>
            <Text fontSize="sm" fontWeight={600} color="text.link">
              {linkLabel}
            </Text>
          </HStack>
        </HStack>
      </Card>
    </Link>
  )
}
