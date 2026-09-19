'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Image, Skeleton, Stack } from '@chakra-ui/react'
import bag from '../i11n.json'

import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../helpers/taskDetailUtils'

function posterDisplayName(task: TaskDetailRecord, fallback: string): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  return fallback
}

export function TaskOwnerCardSkeleton() {
  return (
    <Card layout="section" aria-busy>
      <HStack align="center" gap={3} w="full">
        <Skeleton boxSize="48px" borderRadius="full" flexShrink={0} />
        <Skeleton h="calc(0.875rem * 1.5)" w="40%" borderRadius="md" />
      </HStack>
    </Card>
  )
}

function TaskOwnerContactCta({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)
  if (!task || !permissions.isOrderWorker || !permissions.isOrderActive) {
    return null
  }

  const tel = task.poster?.profile?.contactNumber?.trim() || null
  const mailto = task.poster?.email?.trim() || null
  if (tel) {
    return (
      <Button asChild variant="primary" w="full" size={size}>
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
      <Button asChild variant="primary" w="full" size={size}>
        <Link href={`mailto:${mailto}`} _hover={{ textDecoration: 'none' }}>
          {t.booking.emailCustomer}
        </Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="secondary" w="full" size={size}>
      <Link href="/account" _hover={{ textDecoration: 'none' }}>
        {t.booking.addContact}
      </Link>
    </Button>
  )
}

type TaskOwnerCardProps = {
  /**
   * `stickyBar` — WorkerContactStickyBar chrome (flush mobile pin).
   * Default is the in-flow / desktop Card.
   */
  variant?: 'card' | 'stickyBar'
}

export function TaskOwnerCard({ variant = 'card' }: TaskOwnerCardProps) {
  const { task, pending } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return pending ? <TaskOwnerCardSkeleton /> : null

  const posterName = posterDisplayName(task, t.details.ownerFallback)
  const posterAvatarUrl = task.poster?.profile?.avatarUrl?.trim() || null
  const posterInitials =
    posterName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'TO'
  const sticky = variant === 'stickyBar'

  const identity = (
    <HStack align="center" gap={3} w="full">
      <Box
        flexShrink={0}
        boxSize={sticky ? '40px' : '48px'}
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
      <Heading size="sm" lineHeight="short" minW={0}>
        {posterName}
      </Heading>
    </HStack>
  )

  const body = (
    <Stack gap={3} w="full">
      {identity}
      <TaskOwnerContactCta size={sticky ? 'lg' : 'sm'} />
    </Stack>
  )

  if (sticky) return body
  return <Card layout="section">{body}</Card>
}
