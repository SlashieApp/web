'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Card, Link, SpotIllustration } from '@ui'

import {
  type PipelineInboxRow,
  type PipelineStatusTone,
  countNeedsAttention,
} from '../helpers/pipelineInbox'
import bag from '../i11n.json'

const STATUS_BADGE: Record<
  PipelineStatusTone,
  'success' | 'info' | 'warning' | 'neutral' | 'danger'
> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  neutral: 'neutral',
  danger: 'danger',
}

export type DashboardPipelineInboxProps = {
  postedRows: readonly PipelineInboxRow[]
  workRows: readonly PipelineInboxRow[]
  loading?: boolean
}

export function DashboardPipelineInbox({
  postedRows,
  workRows,
  loading = false,
}: DashboardPipelineInboxProps) {
  const t = useI11n(bag)
  const attention =
    countNeedsAttention(postedRows) + countNeedsAttention(workRows)

  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <Heading size="md" color="text.default">
          {t.inbox.title}
        </Heading>
        <Text fontSize="sm" color="text.muted">
          {attention > 0
            ? formatMessage(t.inbox.needsYou, { count: attention })
            : t.inbox.subtitle}
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>
        <InboxList
          title={t.inbox.postedTitle}
          viewAllHref="/requests"
          viewAllLabel={t.inbox.viewAll}
          rows={postedRows}
          loading={loading}
          emptyTitle={t.inbox.postedEmptyTitle}
          emptyDescription={t.inbox.postedEmptyDescription}
          emptyHref="/tasks/create"
          emptyAction={t.inbox.postedEmptyAction}
          emptySpot="quotes"
        />
        <InboxList
          title={t.inbox.workTitle}
          viewAllHref="/quotes"
          viewAllLabel={t.inbox.viewAll}
          rows={workRows}
          loading={loading}
          emptyTitle={t.inbox.workEmptyTitle}
          emptyDescription={t.inbox.workEmptyDescription}
          emptyHref="/tasks"
          emptyAction={t.inbox.workEmptyAction}
          emptySpot="no-work"
        />
      </Grid>
    </Stack>
  )
}

function InboxList({
  title,
  viewAllHref,
  viewAllLabel,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  emptyHref,
  emptyAction,
  emptySpot,
}: {
  title: string
  viewAllHref: string
  viewAllLabel: string
  rows: readonly PipelineInboxRow[]
  loading: boolean
  emptyTitle: string
  emptyDescription: string
  emptyHref: string
  emptyAction: string
  emptySpot: 'quotes' | 'no-work'
}) {
  const t = useI11n(bag)
  const attention = countNeedsAttention(rows)

  return (
    <Card layout="section" p={{ base: 4, md: 5 }} bodyGap={3}>
      <HStack justify="space-between" align="flex-start" gap={3}>
        <HStack gap={2} minW={0} flexWrap="wrap">
          <Text fontWeight={700} fontSize="md" color="text.default">
            {title}
          </Text>
          {attention > 0 ? (
            <Badge variant="success" size="sm">
              {attention}
            </Badge>
          ) : null}
        </HStack>
        <Link
          href={viewAllHref}
          fontSize="sm"
          fontWeight={600}
          color="text.link"
          flexShrink={0}
          _hover={{ textDecoration: 'none', color: 'text.link' }}
        >
          {viewAllLabel}
        </Link>
      </HStack>

      {loading && rows.length === 0 ? (
        <Stack gap={2} aria-busy="true" aria-label={t.inbox.loading}>
          <InboxSkeleton />
          <InboxSkeleton />
          <InboxSkeleton />
        </Stack>
      ) : rows.length === 0 ? (
        <Stack align="center" textAlign="center" gap={3} py={4}>
          <SpotIllustration variant={emptySpot} width={120} />
          <Stack gap={1}>
            <Text fontWeight={600} color="text.default">
              {emptyTitle}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {emptyDescription}
            </Text>
          </Stack>
          <Button asChild size="md">
            <Link href={emptyHref} _hover={{ textDecoration: 'none' }}>
              {emptyAction}
            </Link>
          </Button>
        </Stack>
      ) : (
        <Stack gap={2}>
          {rows.map((row) => (
            <InboxRow key={row.id} row={row} />
          ))}
        </Stack>
      )}
    </Card>
  )
}

function InboxRow({ row }: { row: PipelineInboxRow }) {
  const t = useI11n(bag)
  const actionLabel = t.inbox.actions[row.actionKind]

  return (
    <HStack
      align="center"
      gap={3}
      p={3}
      borderRadius="lg"
      bg="bg.subtle"
      minH="56px"
    >
      <Stack gap={1} minW={0} flex={1}>
        <Link
          href={row.href}
          fontWeight={600}
          color="text.default"
          lineClamp={2}
          _hover={{ textDecoration: 'none', color: 'text.link' }}
        >
          {row.title}
        </Link>
        <Badge
          variant={STATUS_BADGE[row.statusTone]}
          size="sm"
          dot
          alignSelf="flex-start"
        >
          {row.statusLabel}
        </Badge>
      </Stack>
      <Button
        asChild
        size="md"
        variant={row.needsAttention ? 'primary' : 'secondary'}
        flexShrink={0}
      >
        <Link href={row.actionHref} _hover={{ textDecoration: 'none' }}>
          {actionLabel}
        </Link>
      </Button>
    </HStack>
  )
}

function InboxSkeleton() {
  return (
    <HStack
      align="center"
      gap={3}
      p={3}
      borderRadius="lg"
      bg="bg.subtle"
      minH="56px"
    >
      <Stack gap={2} flex={1} minW={0}>
        <Box h="14px" w="70%" borderRadius="sm" bg="border.default" />
        <Box h="18px" w="96px" borderRadius="md" bg="border.default" />
      </Stack>
      <Box h="44px" w="112px" borderRadius="md" bg="border.default" />
    </HStack>
  )
}
