'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Stack, Text } from '@chakra-ui/react'
import {
  LoginMethod,
  type MeQuery,
  type RequestAccountDeletionMutation,
  type RequestAccountDeletionMutationVariables,
} from '@codegen/schema'
import { useRouter } from 'next/navigation'
import {
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  useState,
} from 'react'

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
import { taskOrderSectionHref } from '@/utils/orderHelpers'
import {
  FormField,
  FormStack,
  Input,
  Link,
  Modal,
  ModalActions,
  ModalButton,
} from '@ui'

import bag from '../../i11n.json'
import { ReauthPrompt } from './ReauthPrompt'

/**
 * The bulleted list a dialog's lead-in sentence introduces. The sentence is the
 * dialog's description (8 under the title, and what a screen reader reads when
 * the dialog opens); the list is the first block of the body, 24 under it, the
 * items 8 apart. Dot bullets, indented 20.
 */
function BulletList({ children }: { children: ReactNode }) {
  return (
    <Stack
      as="ul"
      gap={2}
      ps={5}
      listStyleType="disc"
      fontSize="sm"
      lineHeight="tall"
    >
      {children}
    </Stack>
  )
}

/** Where the OAuth re-auth buttons send the user back to (dialog reopens). */
export const DELETE_REAUTH_RETURN = '/account?delete=confirm'

type DeleteError = 'password' | 'liveOrders' | 'reauth' | 'other'

export type DeletionBlocker = MeQuery['me']['deletionBlockers'][number]

export type DeleteAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  enabledLoginMethods: readonly LoginMethod[]
  /** The user just signed in again (back from `DELETE_REAUTH_RETURN`). */
  reauthed: boolean
  /** `me.deletionBlockers`: live bookings that stop the deletion. */
  deletionBlockers?: readonly DeletionBlocker[]
}

/**
 * FE-198 / BE-74: confirm deleting the account. Password accounts confirm
 * with their password; Google / Apple-only accounts sign in again first (the
 * API only accepts it within 10 minutes of a fresh sign-in). On success the
 * user is signed out and told the deletion date. While `me.deletionBlockers`
 * lists live bookings, the dialog links to them instead and never asks the
 * API (ACCOUNT_HAS_LIVE_ORDERS stays as the fallback).
 */
export function DeleteAccountDialog(props: DeleteAccountDialogProps) {
  const { deletionBlockers = [], open, onOpenChange } = props
  if (deletionBlockers.length > 0) {
    return (
      <DeleteBlockedDialog
        open={open}
        onOpenChange={onOpenChange}
        blockers={deletionBlockers}
      />
    )
  }
  return <DeleteConfirmDialog {...props} />
}

/** Live bookings stop the deletion: one link per booking, no delete button. */
function DeleteBlockedDialog({
  open,
  onOpenChange,
  blockers,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockers: readonly DeletionBlocker[]
}) {
  const t = useI11n(bag)
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t.deleteBlockedTitle}
      description={t.deleteBlockedBody}
      footer={
        <ModalButton
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          {t.deleteBlockedClose}
        </ModalButton>
      }
    >
      <BulletList>
        {blockers.map((blocker, index) => (
          <Box as="li" key={blocker.orderId}>
            <Link
              href={taskOrderSectionHref(blocker.taskId)}
              fontWeight={500}
              color="text.link"
            >
              {formatMessage(t.deleteBlockedBooking, { number: index + 1 })}
            </Link>
          </Box>
        ))}
      </BulletList>
    </Modal>
  )
}

function DeleteConfirmDialog({
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
      description={t.deleteIntro}
      footer={
        <ModalActions>
          <ModalButton
            type="button"
            variant="secondary"
            onClick={() => close(false)}
          >
            {t.deleteCancel}
          </ModalButton>
          <ModalButton
            type="submit"
            form="delete-account-form"
            variant="danger"
            loading={loading}
            disabled={!canConfirm}
          >
            {t.deleteConfirm}
          </ModalButton>
        </ModalActions>
      }
    >
      <FormStack>
        <BulletList>
          {t.deletePoints.map((point) => (
            <Box as="li" key={point}>
              {point}
            </Box>
          ))}
        </BulletList>

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
            <ReauthPrompt
              enabledLoginMethods={enabledLoginMethods}
              next={DELETE_REAUTH_RETURN}
            >
              {t.deleteReauthBody}
            </ReauthPrompt>
          ) : (
            <Text fontSize="sm" color="status.success.fg" fontWeight={500}>
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
              <Link href={MY_TASKS_HREF} fontWeight={500} color="inherit">
                {t.deleteLiveOrdersLink}
              </Link>
            ) : null}
          </Box>
        ) : null}
      </FormStack>
    </Modal>
  )
}
