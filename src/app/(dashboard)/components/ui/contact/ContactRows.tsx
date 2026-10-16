'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Text } from '@chakra-ui/react'
import {
  type CancelEmailChangeMutation,
  type CancelPhoneChangeMutation,
  LoginMethod,
} from '@codegen/schema'
import { type ReactNode, useState } from 'react'

import { pendingEmailChange } from '@/app/(auth)/helpers/emailVerification'
import {
  pendingPhoneChange,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import CancelEmailChange from '@/app/(dashboard)/account/graphql/CancelEmailChange.gql'
import CancelPhoneChange from '@/app/(dashboard)/account/graphql/CancelPhoneChange.gql'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { formatPhoneForDisplay } from '@/utils/phoneNormalize'
import { Badge, Button } from '@ui'

import { SETTING_ROW_DIVIDERS } from '../SettingRow'
import { EmailChangeModal } from '../verification/EmailChangeModal'
import { EmailVerificationModal } from '../verification/EmailVerificationModal'
import { PhoneVerificationModal } from '../verification/PhoneVerificationModal'
import {
  CONTACT_ROW_VIEWS,
  type ContactRowAction,
  type ContactRowConfig,
  getEmailRowView,
  getPhoneRowView,
} from './contactRowView'
import bag from './i11n.json'

type Dialog = 'verifyEmail' | 'changeEmail' | 'phone' | null

const ROW_BUTTON = { size: 'sm', minH: '44px' } as const

/** The provider a Google / Apple account's email comes from. */
function providerName(me: MeSnapshot): string {
  const methods = me.enabledLoginMethods ?? []
  return methods.includes(LoginMethod.Apple) &&
    !methods.includes(LoginMethod.Google)
    ? 'Apple'
    : 'Google'
}

/** A new email or phone waiting for its link or code; the old one stays live. */
function PendingChange({
  channel,
  readOnly,
  children,
  action,
  status,
}: {
  channel: 'email' | 'phone'
  readOnly: boolean
  children: ReactNode
  action: ReactNode
  status?: { text: string; ok: boolean } | null
}) {
  const t = useI11n(bag)
  const getUser = useUserStore((s) => s.getUser)
  const [cancel, { loading }] = useMutation<
    CancelEmailChangeMutation | CancelPhoneChangeMutation
  >(channel === 'email' ? CancelEmailChange : CancelPhoneChange)

  const onCancel = async () => {
    try {
      await cancel()
      await getUser()
      trackFlowSucceeded(EVENTS.contact_change_cancel, { channel })
    } catch {
      showAppToast({ title: t.cancelFailed, type: 'error' })
    }
  }

  return (
    <Stack
      gap={2}
      p={3}
      borderRadius="md"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Text fontSize="sm" color="text.default">
        {children}
      </Text>
      {readOnly ? null : (
        <HStack gap={2} flexWrap="wrap">
          {action}
          <Button
            {...ROW_BUTTON}
            variant="ghost"
            loading={loading}
            onClick={() => void onCancel()}
          >
            {t.cancelChange}
          </Button>
        </HStack>
      )}
      {status ? (
        <Text
          as="output"
          display="block"
          fontSize="sm"
          color={status.ok ? 'text.link' : 'status.danger.fg'}
        >
          {status.text}
        </Text>
      ) : null}
    </Stack>
  )
}

function RowAction({
  action,
  onPress,
}: {
  action: ContactRowAction
  onPress: () => void
}) {
  const t = useI11n(bag)
  const change = action === 'changeEmail' || action === 'changePhone'
  return (
    <Button
      {...ROW_BUTTON}
      variant={change ? 'secondary' : 'primary'}
      onClick={onPress}
    >
      {t.actions[action]}
    </Button>
  )
}

/** One contact row: label and value, the badge, then its one action. */
function ContactRow({
  config,
  value,
  note,
  readOnly,
  onAction,
  pending,
}: {
  config: ContactRowConfig
  value: string
  note?: string | null
  readOnly: boolean
  onAction: (action: ContactRowAction) => void
  pending?: ReactNode
}) {
  const t = useI11n(bag)
  return (
    <Stack gap={3} py={3}>
      <HStack
        justify="space-between"
        align="center"
        gap={3}
        flexWrap="wrap"
        minH="44px"
      >
        <Stack gap={0} minW={0}>
          <Text fontSize="sm" fontWeight={700} color="text.default">
            {config.channel === 'email' ? t.email : t.phone}
          </Text>
          <Text fontSize="sm" color="text.muted" wordBreak="break-word">
            {value}
          </Text>
          {note ? (
            <Text fontSize="xs" color="text.muted">
              {note}
            </Text>
          ) : null}
        </Stack>
        <HStack gap={2} flexWrap="wrap">
          {config.badge ? (
            <Badge variant={config.badge === 'verified' ? 'success' : 'gray'}>
              {t.badge[config.badge]}
            </Badge>
          ) : null}
          {config.action && !readOnly ? (
            <RowAction
              action={config.action}
              onPress={() => onAction(config.action as ContactRowAction)}
            />
          ) : null}
        </HStack>
      </HStack>
      {pending}
    </Stack>
  )
}

function EmailRow({
  me,
  readOnly,
  onOpen,
}: {
  me: MeSnapshot
  readOnly: boolean
  onOpen: (dialog: Dialog) => void
}) {
  const t = useI11n(bag)
  const { resend, isSending, isSent, failure } = useResendVerificationEmail()
  const config = CONTACT_ROW_VIEWS[getEmailRowView(me)]
  const status = isSent
    ? { text: t.linkSent, ok: true }
    : failure
      ? {
          text: failure === 'tooSoon' ? t.linkTooSoon : t.linkFailed,
          ok: false,
        }
      : null

  return (
    <ContactRow
      config={config}
      value={me.email}
      note={
        config.locked
          ? formatMessage(t.locked, { provider: providerName(me) })
          : null
      }
      readOnly={readOnly}
      onAction={(action) =>
        onOpen(action === 'changeEmail' ? 'changeEmail' : 'verifyEmail')
      }
      pending={
        config.pending ? (
          <PendingChange
            channel="email"
            readOnly={readOnly}
            status={status}
            action={
              <Button
                {...ROW_BUTTON}
                variant="secondary"
                loading={isSending}
                onClick={() => void resend()}
              >
                {t.resendLink}
              </Button>
            }
          >
            {formatMessage(t.pendingEmail, { email: pendingEmailChange(me) })}
          </PendingChange>
        ) : null
      }
    />
  )
}

function PhoneRow({
  me,
  readOnly,
  onOpen,
}: {
  me: MeSnapshot
  readOnly: boolean
  onOpen: (dialog: Dialog) => void
}) {
  const t = useI11n(bag)
  const config = CONTACT_ROW_VIEWS[getPhoneRowView(me)]
  const saved = profileContactNumber(me)

  return (
    <ContactRow
      config={config}
      value={saved ? formatPhoneForDisplay(saved) : t.noPhone}
      readOnly={readOnly}
      onAction={() => onOpen('phone')}
      pending={
        config.pending ? (
          <PendingChange
            channel="phone"
            readOnly={readOnly}
            action={
              <Button
                {...ROW_BUTTON}
                variant="secondary"
                onClick={() => onOpen('phone')}
              >
                {t.enterCode}
              </Button>
            }
          >
            {formatMessage(t.pendingPhone, {
              phone: formatPhoneForDisplay(pendingPhoneChange(me)),
            })}
          </PendingChange>
        ) : null
      }
    />
  )
}

export type ContactRowsProps = {
  /** No buttons (a suspended account can't change anything). */
  readOnly?: boolean
  onContactUpdated?: () => void
}

/**
 * The email and phone rows: each shows its value, a Verified / Not verified
 * badge and one action, or the pending change under it. What each row shows
 * comes from `getEmailRowView` / `getPhoneRowView`.
 */
export function ContactRows({
  readOnly = false,
  onContactUpdated,
}: ContactRowsProps) {
  const me = useUserStore((s) => s.me)
  const [dialog, setDialog] = useState<Dialog>(null)
  if (!me) return null

  const close = (open: boolean) => {
    if (!open) setDialog(null)
  }

  return (
    <>
      <Stack gap={0} css={SETTING_ROW_DIVIDERS}>
        <EmailRow me={me} readOnly={readOnly} onOpen={setDialog} />
        <PhoneRow me={me} readOnly={readOnly} onOpen={setDialog} />
      </Stack>
      <EmailVerificationModal
        open={dialog === 'verifyEmail'}
        onOpenChange={close}
        onContactUpdated={onContactUpdated}
      />
      <EmailChangeModal
        open={dialog === 'changeEmail'}
        onOpenChange={close}
        onRequested={onContactUpdated}
      />
      <PhoneVerificationModal
        open={dialog === 'phone'}
        onOpenChange={close}
        onVerified={onContactUpdated}
      />
    </>
  )
}
