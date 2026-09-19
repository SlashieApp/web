'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Image, Skeleton, Stack } from '@chakra-ui/react'
import bag from '../i11n.json'

import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'
import { getTaskOwnerContactAction } from '../helpers/getTaskOwnerContact'
import type { TaskDetailRecord } from '../helpers/taskDetailUtils'

function posterDisplayName(task: TaskDetailRecord, fallback: string): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  return fallback
}

function contactLabel(
  kind: 'tel' | 'mailto' | 'account',
  b: {
    contactCustomer: string
    emailCustomer: string
    addContact: string
  },
): string {
  if (kind === 'tel') return b.contactCustomer
  if (kind === 'mailto') return b.emailCustomer
  return b.addContact
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

type TaskOwnerCardProps = {
  /** Tighter padding when pinned as the mobile sticky card. */
  sticky?: boolean
}

export function TaskOwnerCard({ sticky = false }: TaskOwnerCardProps) {
  const { task, pending, permissions } = useTaskDetail()
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
  const showContact =
    permissions.showWorkerJobBanner ||
    (permissions.isOrderWorker && permissions.isOrderActive)
  const contact = showContact ? getTaskOwnerContactAction(task) : null

  return (
    <Card layout="section" p={sticky ? 4 : undefined}>
      <Stack gap={3}>
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
        {contact ? (
          <Button asChild variant="primary" w="full">
            <Link href={contact.href} _hover={{ textDecoration: 'none' }}>
              {contactLabel(contact.kind, t.booking)}
            </Link>
          </Button>
        ) : null}
      </Stack>
    </Card>
  )
}
