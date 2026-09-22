'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Image, Skeleton, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import bag from '../../i11n.json'

import { publicUserPath } from '@/app/user/[id]/helpers/publicUserHelpers'
import { Avatar, Button, Card, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { TaskDetailMainCtaCard } from '../ui/TaskDetailMainCtaCard'
import { TaskDetailPinCard } from '../ui/TaskDetailPinCard'

function posterDisplayName(task: TaskDetailRecord, fallback: string): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  return fallback
}

export function TaskOwnerCardSkeleton() {
  const t = useI11n(bag)
  return (
    <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={t.details.owner} aria-busy>
      <HStack align="center" gap={3} w="full">
        <Skeleton boxSize="40px" borderRadius="full" flexShrink={0} />
        <Skeleton h="calc(0.875rem * 1.5)" w="40%" borderRadius="md" />
      </HStack>
    </Card>
  )
}

function TaskOwnerContactCta({ compact = false }: { compact?: boolean }) {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)
  if (!task || !permissions.isOrderWorker || !permissions.isOrderActive) {
    return null
  }

  const tel = task.poster?.profile?.contactNumber?.trim() || null
  const mailto = task.poster?.email?.trim() || null
  const width = compact ? undefined : 'full'
  const size = compact ? 'sm' : undefined
  if (tel) {
    return (
      <Button asChild variant="primary" w={width} size={size}>
        <Link
          href={`tel:${tel.replace(/\s/g, '')}`}
          _hover={{ textDecoration: 'none' }}
        >
          {t.cta.contactTask}
        </Link>
      </Button>
    )
  }
  if (mailto) {
    return (
      <Button asChild variant="primary" w={width} size={size}>
        <Link href={`mailto:${mailto}`} _hover={{ textDecoration: 'none' }}>
          {t.booking.emailCustomer}
        </Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="secondary" w={width} size={size}>
      <Link href="/account" _hover={{ textDecoration: 'none' }}>
        {t.booking.addContact}
      </Link>
    </Button>
  )
}

type TaskOwnerCardProps = {
  compact?: boolean
  rail?: boolean
}

export function TaskOwnerCard({
  compact = false,
  rail = false,
}: TaskOwnerCardProps) {
  const { task, pending } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return pending ? <TaskOwnerCardSkeleton /> : null

  const posterName = posterDisplayName(task, t.details.ownerFallback)
  const posterAvatarUrl = task.poster?.profile?.avatarUrl?.trim() || null
  const posterId = task.poster?.id?.trim() || null
  const profileHref = posterId ? publicUserPath(posterId, task.id) : null
  const profileLabel = formatMessage(t.details.viewProfile, {
    name: posterName,
  })
  const posterInitials =
    posterName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'TO'

  const avatar =
    compact || rail ? (
      <Box
        flexShrink={0}
        boxSize="40px"
        borderRadius="full"
        bg="status.success.soft"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="status.success.fg"
        fontWeight={700}
        fontSize="sm"
        overflow="hidden"
      >
        {posterAvatarUrl ? (
          <Image
            src={posterAvatarUrl}
            alt={`${posterName} avatar`}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          posterInitials
        )}
      </Box>
    ) : (
      <Avatar name={posterName} src={posterAvatarUrl ?? undefined} />
    )

  const identity = (
    <PosterIdentity
      href={profileHref}
      label={profileLabel}
      name={posterName}
      avatar={avatar}
    />
  )

  if (rail) {
    return (
      <TaskDetailMainCtaCard
        eyebrow={t.details.owner}
        action={<TaskOwnerContactCta compact />}
      >
        {identity}
      </TaskDetailMainCtaCard>
    )
  }

  if (compact) {
    return (
      <TaskDetailPinCard
        leading={
          profileHref ? (
            <Link
              href={profileHref}
              aria-label={profileLabel}
              display="inline-flex"
              borderRadius="full"
              _hover={{ textDecoration: 'none' }}
            >
              {avatar}
            </Link>
          ) : (
            avatar
          )
        }
        title={
          profileHref ? (
            <Link href={profileHref} tone="muted">
              {posterName}
            </Link>
          ) : (
            posterName
          )
        }
        subtitle={t.details.owner}
        action={<TaskOwnerContactCta compact />}
      />
    )
  }

  return (
    <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={t.details.owner}>
      {identity}
      <TaskOwnerContactCta />
    </Card>
  )
}

function PosterIdentity({
  href,
  label,
  name,
  avatar,
}: {
  href: string | null
  label: string
  name: string
  avatar: ReactNode
}) {
  const nameText = (
    <Text fontSize="sm" fontWeight={600} color="text.default" minW={0} truncate>
      {name}
    </Text>
  )
  if (!href) {
    return (
      <HStack align="center" gap={3} w="full" minW={0}>
        {avatar}
        {nameText}
      </HStack>
    )
  }
  return (
    <Link
      href={href}
      aria-label={label}
      tone="muted"
      display="flex"
      alignItems="center"
      gap={3}
      w="full"
      minW={0}
      _hover={{ textDecoration: 'none' }}
    >
      {avatar}
      {nameText}
    </Link>
  )
}
