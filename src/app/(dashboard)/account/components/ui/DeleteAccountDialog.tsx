'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import {
  LoginMethod,
  type RequestAccountDeletionMutation,
  type RequestAccountDeletionMutationVariables,
} from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import {
  formatDeletionDate,
  loginPathAfterDeletion,
} from '@/app/(auth)/helpers/accountDeletion'
import { useUserStore } from '@/app/(auth)/store/user'
import RequestAccountDeletion from '@/app/(dashboard)/account/graphql/RequestAccountDeletion.gql'
import { useLocale, useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { MY_TASKS_HREF } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'
import {
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
} from '@/utils/graphqlErrors'
import { Button, FormField, Input, Link, Modal } from '@ui'

import bag from '../../i11n.json'

/** Where the OAuth re-auth buttons send the user back to (dialog reopens). */
export const DELETE_REAUTH_RETURN = '/account?delete=confirm'

type DeleteError = 'password' | 'liveOrders' | 'reauth' | 'other'

export type DeleteAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  enabledLoginMethods: readonly LoginMethod[]
  /** The user just signed in again (back from `DELETE_REAUTH_RETURN`). */
  reauthed: boolean
}

/**
 * FE-198 / BE-74: confirm deleting the account. Password accounts confirm
 * with their password; Google / Apple-only accounts sign in again first (the
 * API only accepts it within 10 minutes of a fresh sign-in). On success the
 * user is signed out and told the deletion date.
 */
export function DeleteAccountDialog({
  open,
  onOpenChange,
  enabledLoginMethods,
  reauthed,
}: DeleteAccountDialogProps) {
  const t = useI11n(bag)
  const locale = useLocale()
  const router = useRouter()
  const href = useLocalizedHref()
  const logout = useUserStore((s) => s.logout)
  const hasPassword = enabledLoginMethods.includes(LoginMethod.Password)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ kind: DeleteError; text: string }>()
  const [request, { loading }] = useMutation<
    RequestAccountDeletionMutation,
    RequestAccountDeletionMutationVariables
  >(RequestAccountDeletion)

  const needsReauth = !hasPassword && (!reauthed || error?.kind === 'reauth')
  const canConfirm = hasPassword ? password.length > 0 : !needsReauth

  const confirm = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!canConfirm || loading) return
    setError(undefined)
    try {
      const result = await request({
        variables: { password: hasPassword ? password : null },
      })
      const scheduledFor =
        result.data?.requestAccountDeletion.deletionScheduledFor ?? null
      const date = scheduledFor ? formatDeletionDate(scheduledFor, locale) : ''
      showAppToast({
        title: date
          ? formatMessage(t.deleteScheduled, { date })
          : t.deleteScheduledNoDate,
        type: 'success',
      })
      // Sign out first: every other request now fails for this account.
      logout()
      router.push(
        href(
          scheduledFor
            ? loginPathAfterDeletion(scheduledFor)
            : '/login?deletion=1',
        ),
      )
    } catch (err) {
      const code = getGraphQLErrorCode(err)
      if (code === 'INVALID_CREDENTIALS') {
        setError({ kind: 'password', text: t.deleteWrongPassword })
      } else if (code === 'ACCOUNT_HAS_LIVE_ORDERS') {
        setError({ kind: 'liveOrders', text: t.deleteLiveOrders })
      } else if (code === 'REAUTH_REQUIRED') {
        setError({ kind: 'reauth', text: t.deleteReauthExpired })
      } else {
        setError({
          kind: 'other',
          text: getFriendlyErrorMessage(err, t.deleteFailed),
        })
      }
    }
  }

  const close = (next: boolean) => {
    if (!next) {
      setPassword('')
      setError(undefined)
    }
    onOpenChange(next)
  }

  return (
    <Modal
      open={open}
      onOpenChange={close}
      title={t.deleteDialogTitle}
      footer={
        <HStack gap={3} w="full" justify="flex-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => close(false)}
          >
            {t.deleteCancel}
          </Button>
          <Button
            type="submit"
            form="delete-account-form"
            variant="danger"
            loading={loading}
            disabled={!canConfirm}
          >
            {t.deleteConfirm}
          </Button>
        </HStack>
      }
    >
      <Stack gap={2}>
        <Text color="text.default" fontWeight={600}>
          {t.deleteIntro}
        </Text>
        <Box
          as="ul"
          ps={5}
          listStyleType="disc"
          fontSize="sm"
          lineHeight="tall"
        >
          {t.deletePoints.map((point) => (
            <Box as="li" key={point} mb={1.5}>
              {point}
            </Box>
          ))}
        </Box>
      </Stack>

      <form id="delete-account-form" onSubmit={confirm} noValidate>
        {hasPassword ? (
          <FormField
            label={t.deletePasswordLabel}
            helperText={t.deletePasswordHelp}
            errorText={error?.kind === 'password' ? error.text : undefined}
          >
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        ) : needsReauth ? (
          <Stack gap={3}>
            <Text fontSize="sm">{t.deleteReauthBody}</Text>
            {enabledLoginMethods.includes(LoginMethod.Google) ? (
              <GoogleAuthButton next={DELETE_REAUTH_RETURN} />
            ) : null}
            {enabledLoginMethods.includes(LoginMethod.Apple) ? (
              <AppleAuthButton next={DELETE_REAUTH_RETURN} />
            ) : null}
          </Stack>
        ) : (
          <Text fontSize="sm" color="status.success.fg" fontWeight={600}>
            {t.deleteReauthDone}
          </Text>
        )}
      </form>

      {error && error.kind !== 'password' ? (
        <Box
          role="alert"
          p={3}
          borderRadius="md"
          bg="status.danger.soft"
          color="status.danger.fg"
          fontSize="sm"
        >
          <Text>{error.text}</Text>
          {error.kind === 'liveOrders' ? (
            <Link href={MY_TASKS_HREF} fontWeight={700} color="inherit">
              {t.deleteLiveOrdersLink}
            </Link>
          ) : null}
        </Box>
      ) : null}
    </Modal>
  )
}
