'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Image, Skeleton, Stack } from '@chakra-ui/react'
import bag from '../i11n.json'

import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../helpers/taskDetailTabs'
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

function TaskOwnerContactActions() {
  const { task, permissions, setActiveTab } = useTaskDetail()
  const t = useI11n(bag)
  const b = t.booking
  if (!task) return null

  const poster = task.poster
  const tel = poster?.profile?.contactNumber?.trim() || null
  const mailto = poster?.email?.trim() || null

  return (
    <Stack gap={2} w="full">
      {tel ? (
        <Button asChild variant="primary" w="full">
          <Link
            href={`tel:${tel.replace(/\s/g, '')}`}
            _hover={{ textDecoration: 'none' }}
          >
            {b.contactCustomer}
          </Link>
        </Button>
      ) : mailto ? (
        <Button asChild variant="primary" w="full">
          <Link href={`mailto:${mailto}`} _hover={{ textDecoration: 'none' }}>
            {b.emailCustomer}
          </Link>
        </Button>
      ) : (
        <Button asChild variant="secondary" w="full">
          <Link href="/account" _hover={{ textDecoration: 'none' }}>
            {b.addContact}
          </Link>
        </Button>
      )}
      {permissions.showCompleteWithCode ? (
        <Button
          variant="secondary"
          w="full"
          onClick={() => {
            setActiveTab(TASK_DETAIL_TAB.overview, {
              hash: 'worker-job-panel',
              scrollId: 'worker-job-panel',
            })
          }}
        >
          {t.cta.complete}
        </Button>
      ) : null}
    </Stack>
  )
}

export function TaskOwnerCard({
  includeActions = false,
}: {
  includeActions?: boolean
} = {}) {
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

  return (
    <Card
      layout="section"
      heading={includeActions ? t.details.owner : undefined}
    >
      <Stack gap={includeActions ? 3 : 0} w="full">
        <HStack align="center" gap={3} w="full">
          <Box
            flexShrink={0}
            boxSize="48px"
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
        {includeActions ? <TaskOwnerContactActions /> : null}
      </Stack>
    </Card>
  )
}
