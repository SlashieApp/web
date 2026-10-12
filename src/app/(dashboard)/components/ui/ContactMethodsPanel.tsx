'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Text } from '@chakra-ui/react'
import type {
  CancelEmailChangeMutation,
  CancelPhoneChangeMutation,
} from '@codegen/schema'
import { type ReactNode, useState } from 'react'

import {
  canChangeEmail,
  isEmailVerified,
  pendingEmailChange,
} from '@/app/(auth)/helpers/emailVerification'
import {
  hasVerifiedContactMethod,
  isPhoneVerified,
  pendingPhoneChange,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import CancelEmailChange from '@/app/(dashboard)/account/graphql/CancelEmailChange.gql'
import CancelPhoneChange from '@/app/(dashboard)/account/graphql/CancelPhoneChange.gql'
import { EVENTS, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { formatPhoneForDisplay } from '@/utils/phoneNormalize'
import { Badge, Button } from '@ui'

import { EmailChangeModal } from './verification/EmailChangeModal'
import { EmailVerificationModal } from './verification/EmailVerificationModal'
import { PhoneVerificationModal } from './verification/PhoneVerificationModal'

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge variant={verified ? 'success' : 'gray'}>
      {verified ? 'Verified' : 'Unverified'}
    </Badge>
  )
}

/** A new email or phone waiting to be verified; the old one stays live. */
function PendingChange({
  channel,
  children,
  action,
  status,
}: {
  channel: 'email' | 'phone'
  children: ReactNode
  action: ReactNode
  /** Result of the action, e.g. "Verification email sent." */
  status?: { text: string; ok: boolean } | null
}) {
  const getUser = useUserStore((s) => s.getUser)
  const [cancel, { loading }] = useMutation<
    CancelEmailChangeMutation | CancelPhoneChangeMutation
  >(channel === 'email' ? CancelEmailChange : CancelPhoneChange)

  const onCancel = async () => {
    try {
      await cancel()
      await getUser()
      trackFlowSucceeded(EVENTS.contact_change_cancel, { channel })
    } catch (e) {
      showAppToast({
        title: getFriendlyErrorMessage(e, 'Could not cancel the change.'),
        type: 'error',
      })
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
      <HStack gap={2} flexWrap="wrap">
        {action}
        <Button
          size="sm"
          variant="ghost"
          loading={loading}
          onClick={() => void onCancel()}
        >
          Cancel change
        </Button>
      </HStack>
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

function EmailContactRow({
  onContactUpdated,
}: { onContactUpdated?: () => void }) {
  const me = useUserStore((s) => s.me)
  const [modalOpen, setModalOpen] = useState(false)
  const [changeOpen, setChangeOpen] = useState(false)
  const { resend, isSending, isSent, message } = useResendVerificationEmail()

  if (!me) return null
  const verified = isEmailVerified(me)
  const pending = pendingEmailChange(me)

  return (
    <>
      <Stack
        gap={3}
        borderBottomWidth="1px"
        borderColor="border.default"
        pb={4}
      >
        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={0} minW={0}>
            <Text fontSize="sm" fontWeight={700} color="text.default">
              Email
            </Text>
            <Text fontSize="sm" color="text.muted">
              {me.email}
            </Text>
          </Stack>
          <HStack gap={3} flexWrap="wrap">
            <VerifiedBadge verified={verified} />
            {/* With a change pending, a resend goes to the new address. */}
            {!verified && !pending ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              >
                Verify
              </Button>
            ) : null}
            {canChangeEmail(me) && !pending ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setChangeOpen(true)}
              >
                Change
              </Button>
            ) : null}
          </HStack>
        </HStack>
        {pending ? (
          <PendingChange
            channel="email"
            status={message ? { text: message, ok: isSent } : null}
            action={
              <Button
                size="sm"
                variant="secondary"
                loading={isSending}
                onClick={() => void resend()}
              >
                Resend link
              </Button>
            }
          >
            Waiting for you to open the link we sent to{' '}
            <Text as="span" fontWeight={600}>
              {pending}
            </Text>
            . Your current email stays on your account until then.
          </PendingChange>
        ) : null}
      </Stack>
      <EmailVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onContactUpdated={onContactUpdated}
      />
      <EmailChangeModal
        open={changeOpen}
        onOpenChange={setChangeOpen}
        onRequested={onContactUpdated}
      />
    </>
  )
}

export function PhoneContactRow({
  onContactUpdated,
}: { onContactUpdated?: () => void }) {
  const me = useUserStore((s) => s.me)
  const [modalOpen, setModalOpen] = useState(false)

  if (!me) return null

  const savedPhone = profileContactNumber(me)
  const verified = isPhoneVerified(me)
  const pending = pendingPhoneChange(me)
  const displayPhone = savedPhone
    ? formatPhoneForDisplay(savedPhone)
    : 'No number saved'

  return (
    <>
      <Stack gap={3}>
        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={0} minW={0}>
            <Text fontSize="sm" fontWeight={700} color="text.default">
              Phone
            </Text>
            <Text fontSize="sm" color="text.muted">
              {displayPhone}
            </Text>
          </Stack>
          <HStack gap={3} flexWrap="wrap">
            {savedPhone ? <VerifiedBadge verified={verified} /> : null}
            {!pending ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              >
                {verified ? 'Change' : savedPhone ? 'Verify' : 'Add phone'}
              </Button>
            ) : null}
          </HStack>
        </HStack>
        {pending ? (
          <PendingChange
            channel="phone"
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              >
                Enter code
              </Button>
            }
          >
            Waiting for the code we texted to{' '}
            <Text as="span" fontWeight={600}>
              {formatPhoneForDisplay(pending)}
            </Text>
            . Your current number stays on your account until then.
          </PendingChange>
        ) : null}
      </Stack>
      <PhoneVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerified={onContactUpdated}
      />
    </>
  )
}

type ContactMethodsPanelProps = {
  compact?: boolean
  showIntro?: boolean
  /**
   * Readiness requires a verified PHONE, not just any contact method.
   * Worker setup uses this — the BE requires a strictly verified phone to
   * finish setup and send quotes (2026-07-13).
   */
  requirePhone?: boolean
  onContactUpdated?: () => void
}

/** Account-level email and phone verification (`me.email`, `me.phoneVerified`). */
export function ContactMethodsPanel({
  showIntro = true,
  requirePhone = false,
  onContactUpdated,
}: ContactMethodsPanelProps) {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  const ready = requirePhone
    ? isPhoneVerified(me)
    : hasVerifiedContactMethod(me)

  return (
    <Stack gap={4}>
      {showIntro ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          Confirm email or phone so Slashie can reach you. This is contact proof
          only, not an identity, DBS, or safety check. Payment is arranged
          directly between you and the customer outside Slashie.
        </Text>
      ) : null}

      <EmailContactRow onContactUpdated={onContactUpdated} />
      <PhoneContactRow onContactUpdated={onContactUpdated} />

      {ready ? (
        <Text fontSize="sm" fontWeight={600} color="text.link">
          {requirePhone
            ? 'Your phone number is verified. You can continue when ready.'
            : 'At least one contact method is verified. You can continue when ready.'}
        </Text>
      ) : (
        <Text fontSize="sm" color="text.muted">
          {requirePhone
            ? 'Verify your phone number to continue. A verified phone is required to send quotes.'
            : 'Verify your email or phone to continue.'}
        </Text>
      )}
    </Stack>
  )
}
