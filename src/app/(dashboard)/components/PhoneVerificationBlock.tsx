'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import type {
  SendPhoneVerificationMutation,
  VerifyPhoneMutation,
} from '@codegen/schema'
import NextLink from 'next/link'
import { useCallback, useRef, useState } from 'react'

import {
  isPhoneVerificationRateLimited,
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import SendPhoneVerification from '@/app/(dashboard)/account/graphql/SendPhoneVerification.gql'
import VerifyPhone from '@/app/(dashboard)/account/graphql/VerifyPhone.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  formatPhoneForDisplay,
  maskPhoneForDisplay,
  phonesMatchForApi,
  toE164ForApi,
} from '@/utils/phoneNormalize'
import { Badge, Button, FormField, Input } from '@ui'

type PhoneVerificationBlockProps = {
  /** When profile phone draft differs from saved `me.profile.contactNumber`. */
  profilePhoneDirty?: boolean
  /** Compact layout for account / worker embeds. */
  compact?: boolean
  /** Reset OTP state when parent saves a new phone number. */
  resetKey?: string
  /** Fires after phone verification succeeds and `me` is refreshed. */
  onVerified?: () => void
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      bg={verified ? 'primary.100' : 'badgeBg'}
      color={verified ? 'primary.800' : 'cardFg'}
    >
      {verified ? 'Verified' : 'Unverified'}
    </Badge>
  )
}

export function PhoneVerificationBlock({
  profilePhoneDirty = false,
  compact = false,
  resetKey,
  onVerified,
}: PhoneVerificationBlockProps) {
  const me = useUserStore((s) => s.me)
  const getUser = useUserStore((s) => s.getUser)
  const savedPhone = profileContactNumber(me)
  const verified = isPhoneVerified(me)

  const [otpStep, setOtpStep] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [codeSentForPhone, setCodeSentForPhone] = useState<string | null>(null)

  const [sendPhoneVerification, { loading: sending }] =
    useMutation<SendPhoneVerificationMutation>(SendPhoneVerification)
  const [verifyPhone, { loading: verifying }] =
    useMutation<VerifyPhoneMutation>(VerifyPhone)

  const resetOtpState = useCallback(() => {
    setOtpStep(false)
    setCode('')
    setError(null)
    setHint(null)
    setRateLimited(false)
    setCodeSentForPhone(null)
  }, [])

  const lastResetKeyRef = useRef(resetKey)
  const onResetKeyRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !resetKey || lastResetKeyRef.current === resetKey) return
      lastResetKeyRef.current = resetKey
      resetOtpState()
    },
    [resetKey, resetOtpState],
  )

  if (!me) return null

  const profileChangedSinceSend =
    Boolean(codeSentForPhone) &&
    (profilePhoneDirty ||
      !phonesMatchForApi(savedPhone, codeSentForPhone ?? ''))

  const sendCode = async () => {
    if (!savedPhone) {
      setError('Save your phone number first, then verify.')
      return
    }
    if (profilePhoneDirty) {
      setError('Save your phone number before requesting a code.')
      return
    }

    setError(null)
    setHint(null)
    try {
      const phoneForApi = toE164ForApi(savedPhone)
      const result = await sendPhoneVerification({
        variables: { phone: phoneForApi },
      })
      if (!result.data?.sendPhoneVerification) {
        throw new Error('Could not send verification code.')
      }
      setCodeSentForPhone(savedPhone)
      setOtpStep(true)
      setRateLimited(false)
      trackFlowSucceeded(EVENTS.phone_verify_send_success)
      setHint(
        `Code sent to ${maskPhoneForDisplay(formatPhoneForDisplay(savedPhone))}.`,
      )
    } catch (e) {
      trackFlowFailed(EVENTS.phone_verify_send_fail, e, {
        flow: 'phone_verify',
        action: 'sendPhoneVerification',
        operation: 'SendPhoneVerification',
      })
      if (isPhoneVerificationRateLimited(e)) {
        setRateLimited(true)
      }
      setError(getFriendlyErrorMessage(e, 'Could not send verification code.'))
    }
  }

  const confirmCode = async () => {
    const trimmed = code.trim()
    if (!/^\d{6}$/.test(trimmed)) {
      setError('Enter the 6-digit code from your SMS.')
      return
    }
    if (profileChangedSinceSend) {
      setError('Phone changed — save and request a new code.')
      return
    }

    setError(null)
    try {
      const result = await verifyPhone({ variables: { code: trimmed } })
      if (!result.data?.verifyPhone) {
        throw new Error('Could not verify your phone number.')
      }
      await getUser()
      resetOtpState()
      trackFlowSucceeded(EVENTS.phone_verify_success)
      onVerified?.()
      showAppToast({
        title: 'Phone verified',
        description: 'Your phone number is now verified on your account.',
        type: 'success',
      })
    } catch (e) {
      trackFlowFailed(EVENTS.phone_verify_fail, e, {
        flow: 'phone_verify',
        action: 'verifyPhone',
        operation: 'VerifyPhone',
      })
      setError(getFriendlyErrorMessage(e, 'That code did not work. Try again.'))
    }
  }

  if (!savedPhone) {
    return (
      <Stack gap={2}>
        <Text fontSize="sm" color="formLabelMuted">
          Save your phone number first, then verify.
        </Text>
        <Link
          as={NextLink}
          href="/profile#profile-phone"
          fontSize="sm"
          fontWeight={600}
          color="primary.600"
          _hover={{ textDecoration: 'none', color: 'primary.700' }}
        >
          Add phone on Profile
        </Link>
      </Stack>
    )
  }

  if (verified && !otpStep) {
    return (
      <HStack gap={3} flexWrap="wrap" align="center">
        <VerifiedBadge verified />
        <Text fontSize="sm" color="formLabelMuted">
          {formatPhoneForDisplay(savedPhone)}
        </Text>
        {!compact ? (
          <Text fontSize="xs" color="formLabelMuted">
            To use a different number, update it on your profile first.
          </Text>
        ) : null}
      </HStack>
    )
  }

  return (
    <Stack ref={onResetKeyRef} gap={3}>
      <HStack gap={3} flexWrap="wrap" align="center">
        <VerifiedBadge verified={false} />
        <Text fontSize="sm" fontWeight={600} color="cardFg">
          Verifying: {formatPhoneForDisplay(savedPhone)}
        </Text>
      </HStack>

      {!otpStep ? (
        <Stack gap={2}>
          <Text fontSize="sm" color="formLabelMuted">
            We&apos;ll send a 6-digit code to the number saved on your profile.
          </Text>
          <Button
            size="sm"
            variant="primary"
            onClick={() => void sendCode()}
            loading={sending}
            disabled={rateLimited || profilePhoneDirty}
            alignSelf="flex-start"
          >
            Send code
          </Button>
        </Stack>
      ) : (
        <Stack gap={3}>
          {profileChangedSinceSend ? (
            <Text fontSize="sm" color="orange.600" fontWeight={600}>
              Phone changed — save and request a new code.
            </Text>
          ) : null}
          {hint ? (
            <Text fontSize="sm" color="formLabelMuted">
              {hint}
            </Text>
          ) : null}
          <FormField label="6-digit SMS code">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              rootProps={{ maxW: '200px' }}
            />
          </FormField>
          <HStack gap={3} flexWrap="wrap">
            <Button
              size="sm"
              variant="primary"
              onClick={() => void confirmCode()}
              loading={verifying}
              disabled={profileChangedSinceSend}
            >
              Verify
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void sendCode()}
              loading={sending}
              disabled={rateLimited || profilePhoneDirty}
            >
              Resend code
            </Button>
            <Button size="sm" variant="ghost" onClick={resetOtpState}>
              Cancel
            </Button>
          </HStack>
        </Stack>
      )}

      {error ? (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      ) : null}
    </Stack>
  )
}
