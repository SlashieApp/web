'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { RestoreAccountMutation } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useSyncExternalStore } from 'react'
import { LuClock } from 'react-icons/lu'

import RestoreAccount from '@/app/(auth)/graphql/RestoreAccount.gql'
import { formatDeletionDate } from '@/app/(auth)/helpers/accountDeletion'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useLocale, useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  clearDeletionScheduled,
  getDeletionScheduledFlag,
  subscribeDeletionScheduled,
} from '@/utils/accountDeletionState'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Logo } from '@ui'

import bag from '../i11n.json'

/**
 * FE-198: what a signed-in account waiting for deletion sees instead of the
 * app. Only Restore (BE `restoreAccount`) or Sign out; nothing else works for
 * that account until it is restored.
 */
export function AccountRestoreScreen({
  scheduledFor,
}: {
  scheduledFor: string | null
}) {
  const t = useI11n(bag).restore
  const locale = useLocale()
  const router = useRouter()
  const href = useLocalizedHref()
  const logout = useUserStore((s) => s.logout)
  const getUser = useUserStore((s) => s.getUser)
  const [restore, { loading }] =
    useMutation<RestoreAccountMutation>(RestoreAccount)
  const date = scheduledFor ? formatDeletionDate(scheduledFor, locale) : null

  const onRestore = async () => {
    try {
      await restore()
      clearDeletionScheduled()
      await getUser()
      showAppToast({ title: t.restored, type: 'success' })
    } catch (error) {
      showAppToast({
        title: getFriendlyErrorMessage(error, t.restoreFailed),
        type: 'error',
      })
    }
  }

  const onSignOut = () => {
    logout()
    router.push(href('/login'))
  }

  return (
    <Box
      as="main"
      minH="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={10}
      bg="bg.subtle"
    >
      <Stack
        as="section"
        aria-labelledby="account-restore-title"
        w="full"
        maxW="28rem"
        align="center"
        textAlign="center"
        gap={5}
        p={{ base: 6, md: 8 }}
        bg="bg.surface"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.default"
        boxShadow="e3"
      >
        <Logo />
        <Box
          boxSize="48px"
          borderRadius="full"
          bg="status.warning.soft"
          color="status.warning.fg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <LuClock size={24} />
        </Box>
        <Stack gap={2}>
          <Heading as="h1" id="account-restore-title" fontSize="xl">
            {t.title}
          </Heading>
          <Text color="text.muted" lineHeight="tall">
            {date ? formatMessage(t.body, { date }) : t.bodyNoDate}
          </Text>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {t.keepNote}
          </Text>
        </Stack>
        <Stack w="full" gap={2}>
          <Button variant="primary" loading={loading} onClick={onRestore}>
            {t.restore}
          </Button>
          <Button variant="ghost" onClick={onSignOut}>
            {t.signOut}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

/**
 * Shows the restore screen instead of the app while the signed-in account is
 * waiting for deletion: from `me.deletionScheduledFor`, or from any request
 * that failed with ACCOUNT_DELETION_SCHEDULED (then `me` is refetched for
 * the date, and the flag cleared if the account turned out to be fine).
 */
export function AccountRestoreGate({ children }: { children: ReactNode }) {
  const me = useMe()
  const getUser = useUserStore((s) => s.getUser)
  const flagged = useSyncExternalStore(
    subscribeDeletionScheduled,
    getDeletionScheduledFlag,
    () => false,
  )
  const scheduledFor = me?.deletionScheduledFor ?? null

  useEffect(() => {
    if (!flagged || scheduledFor) return
    if (!getAuthToken()) {
      clearDeletionScheduled()
      return
    }
    void getUser().then(() => {
      if (!useUserStore.getState().me?.deletionScheduledFor) {
        clearDeletionScheduled()
      }
    })
  }, [flagged, scheduledFor, getUser])

  if (!scheduledFor && !flagged) return children
  return <AccountRestoreScreen scheduledFor={scheduledFor} />
}
