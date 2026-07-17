'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { LuCircleCheck, LuClock3, LuInfo, LuWallet } from 'react-icons/lu'

import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'
import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'
import { formatDate, formatPounds } from '@/utils/dashboardHelpers'
import {
  formatOrderAgreedPrice,
  orderStatusChipLabel,
  orderTaskHref,
} from '@/utils/orderHelpers'
import { Badge, Card, Link } from '@ui'

import { useAccountOrders } from '../helpers/useAccountOrders'

const SECTION_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Pending', href: '#pending' },
  { label: 'Closed', href: '#closed' },
] as const

/**
 * Reference-only earnings log. Slashie does not handle payouts; this page only
 * tallies order amounts for your records.
 */
export default function EarningsPage() {
  const {
    loading,
    errorMessage,
    pendingEarningsPence,
    completedEarningsPence,
    pendingWorkerOrders,
    closedWorkerOrders,
  } = useAccountOrders()

  return (
    <DashboardPageLayout
      eyebrow="EARNINGS"
      title="Earnings log"
      description="Worker earnings from your orders. Reference only — Slashie does not handle payments between customers and workers."
      sections={SECTION_LINKS}
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
            label="Pending"
            value={loading ? '…' : formatPounds(pendingEarningsPence)}
            hint="Sum of agreed prices on orders still in progress (ACTIVE)."
            icon={<LuClock3 size={18} aria-hidden />}
          />
          <SummaryStatCard
            label="Completed"
            value={loading ? '…' : formatPounds(completedEarningsPence)}
            hint="Sum of agreed prices on closed orders (CLOSED)."
            icon={<LuCircleCheck size={18} aria-hidden />}
          />
          <DashboardSectionCard
            title="Reference only"
            description="Slashie does not process payouts."
            icon={<LuInfo size={18} aria-hidden />}
          >
            <Stack gap={3}>
              <Text fontSize="sm" color="text.muted" lineHeight="tall">
                These totals are for your records. Arrange payment directly with
                the customer.
              </Text>
              <Link
                href="/billing"
                fontSize="sm"
                fontWeight={600}
                color="text.link"
              >
                Platform billing →
              </Link>
            </Stack>
          </DashboardSectionCard>
        </>
      }
    >
      <Box display={{ base: 'grid', lg: 'none' }}>
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={4}>
          <SummaryStatCard
            label="Pending"
            value={loading ? '…' : formatPounds(pendingEarningsPence)}
            hint="Orders still in progress"
            icon={<LuClock3 size={18} aria-hidden />}
          />
          <SummaryStatCard
            label="Completed"
            value={loading ? '…' : formatPounds(completedEarningsPence)}
            hint="Closed orders"
            icon={<LuCircleCheck size={18} aria-hidden />}
          />
        </Grid>
      </Box>

      <Stack gap={3} id="pending" scrollMarginTop="96px">
        <HStack gap={2}>
          <LuClock3 size={18} aria-hidden />
          <Heading as="h2" fontSize="md" fontWeight={600}>
            Pending orders
          </Heading>
        </HStack>
        {pendingWorkerOrders.length === 0 ? (
          <DashboardSectionCard
            title="No pending earnings"
            description="Accepted quotes create an order immediately — agreed value shows here until the order is closed."
          >
            <Text fontSize="sm" color="text.muted">
              When a customer accepts your quote, it will appear in this list.
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
                badge={<Badge variant="success">Worker</Badge>}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <Stack gap={3} id="closed" scrollMarginTop="96px">
        <HStack gap={2}>
          <LuCircleCheck size={18} aria-hidden />
          <Heading as="h2" fontSize="md" fontWeight={600}>
            Closed orders
          </Heading>
        </HStack>
        {closedWorkerOrders.length === 0 ? (
          <DashboardSectionCard
            title="No closed orders yet"
            description="Closed orders appear here after you and the customer finish the job on Slashie."
          >
            <Text fontSize="sm" color="text.muted">
              Completed work will show agreed amounts for your records.
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
                badge={<Badge variant="info">Closed</Badge>}
                linkLabel="Open task →"
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
  href,
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
    <Link href={href} _hover={{ textDecoration: 'none' }}>
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
