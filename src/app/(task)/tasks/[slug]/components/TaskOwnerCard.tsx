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

type TaskOwnerCardProps = {
  /**
   * Worker role card: contact CTA plus complete-with-code when that flow
   * is available. Default is identity-only (overview / quotes sidebar).
   */
  roleActions?: boolean
}

export function TaskOwnerCard({ roleActions = false }: TaskOwnerCardProps) {
  const { task, pending, permissions, setActiveTab } = useTaskDetail()
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

  const tel = task.poster?.profile?.contactNumber?.trim() || null
  const mailto = task.poster?.email?.trim() || null
  const showComplete = roleActions && permissions.showCompleteWithCode
  const showContact = roleActions && permissions.isOrderWorker
  const contactVariant = showComplete ? 'secondary' : 'primary'

  return (
    <Card layout="section">
      <Stack gap={4}>
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
          <Stack gap={0} minW={0} flex="1">
            <Box
              fontSize="xs"
              fontWeight={600}
              color="text.muted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              {t.details.owner}
            </Box>
            <Heading size="sm" lineHeight="short" minW={0}>
              {posterName}
            </Heading>
          </Stack>
        </HStack>
        {showComplete || showContact ? (
          <Stack gap={2}>
            {showComplete ? (
              <Button
                variant="primary"
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
            {showContact ? (
              tel ? (
                <Button asChild variant={contactVariant} w="full">
                  <Link
                    href={`tel:${tel.replace(/\s/g, '')}`}
                    _hover={{ textDecoration: 'none' }}
                  >
                    {t.booking.contactCustomer}
                  </Link>
                </Button>
              ) : mailto ? (
                <Button asChild variant={contactVariant} w="full">
                  <Link
                    href={`mailto:${mailto}`}
                    _hover={{ textDecoration: 'none' }}
                  >
                    {t.booking.emailCustomer}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" w="full">
                  <Link href="/account" _hover={{ textDecoration: 'none' }}>
                    {t.booking.addContact}
                  </Link>
                </Button>
              )
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
