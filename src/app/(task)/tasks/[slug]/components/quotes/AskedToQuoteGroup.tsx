'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlEyebrow } from '@/theme/styles'
import { Link } from '@ui'

import type { TaskQuoteInvitationRow } from '../../helpers/taskDetailUtils'
import { workerQuoteAvatarLabel } from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'
import { QuoteAvatar } from './QuoteRow'

export type AskedToQuoteGroupProps = {
  invitations: readonly TaskQuoteInvitationRow[]
  taskId: string
  /** A rule above the group when quotes are listed over it. */
  withTopDivider?: boolean
}

/** Initials, or the id-based label when the name has none. */
function initialsOf(name: string, workerUserId: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
  return initials || workerQuoteAvatarLabel(workerUserId)
}

/**
 * The owner's "Asked to quote" group (FE-507): the workers they asked who have
 * not quoted yet (one who said Not for me is in it too: the customer is never
 * told). Each row links to the worker's profile. Only shown when there is one.
 */
export function AskedToQuoteGroup({
  invitations,
  taskId,
  withTopDivider = false,
}: AskedToQuoteGroupProps) {
  const { quotes: q, fallbackWorker } = useI11n(bag)
  if (invitations.length === 0) return null
  return (
    <Stack
      as="section"
      aria-label={q.asked.heading}
      gap={1}
      pt={withTopDivider ? 4 : 0}
      borderTopWidth={withTopDivider ? '1px' : 0}
      borderColor="border.default"
    >
      <Text {...sdlEyebrow}>{q.asked.heading}</Text>
      <Stack as="ul" gap={0} listStyleType="none" m={0} p={0}>
        {invitations.map((invitation) => {
          const name = invitation.name.trim() || fallbackWorker
          return (
            <li key={invitation.workerUserId}>
              <Link
                href={publicProfilePath(invitation.workerUserId, {
                  fromTask: taskId,
                })}
                aria-label={formatMessage(q.asked.viewProfileFor, { name })}
                display="block"
                py={3}
                color="text.default"
                _hover={{ textDecoration: 'none' }}
              >
                <HStack gap={3} align="center">
                  <QuoteAvatar
                    name={name}
                    avatarLabel={initialsOf(name, invitation.workerUserId)}
                    avatarUrl={invitation.avatarUrl}
                    size="40px"
                  />
                  <Stack gap={0.5} flex={1} minW={0}>
                    <Text fontWeight={500} truncate>
                      {name}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {q.asked.noQuote}
                    </Text>
                  </Stack>
                </HStack>
              </Link>
            </li>
          )
        })}
      </Stack>
    </Stack>
  )
}
