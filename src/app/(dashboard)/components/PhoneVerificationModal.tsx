'use client'

import { useMutation } from '@apollo/client/react'
import { Stack, Text } from '@chakra-ui/react'
import type {
  SendPhoneVerificationMutation,
  UpdateMyProfileMutation,
  VerifyPhoneMutation,
} from '@codegen/schema'
import { useCallback, useState } from 'react'

import {
  isPhoneVerificationRateLimited,
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import SendPhoneVerification from '@/app/(dashboard)/account/graphql/SendPhoneVerification.gql'
import VerifyPhone from '@/app/(dashboard)/account/graphql/VerifyPhone.gql'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  formatPhoneForDisplay,
  maskPhoneForDisplay,
  toE164ForApi,
} from '@/utils/phoneNormalize'
import { FormField, Modal, OtpInput, PhoneInput } from '@ui'

type PhoneVerificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified?: () => void
}

type Step = 'phone' | 'code'

export function PhoneVerificationModal({
  open,
  onOpenChange,
  onVerified,
}: PhoneVerificationModalProps) {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const getUser = useUserStore((s) => s.getUser)

  const savedPhone = profileContactNumber(me)
  const [step, setStep] = useState<Step>('phone')
  const [phoneDraft, setPhoneDraft] = useState('')
  const [activePhone, setActivePhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)

  const [updateMyProfile, { loading: saving }] =
    useMutation<UpdateMyProfileMutation>(UpdateMyProfile)
  const [sendPhoneVerification, { loading: sending }] =
    useMutation<SendPhoneVerificationMutation>(SendPhoneVerification)
  const [verifyPhone, { loading: verifying }] =
    useMutation<VerifyPhoneMutation>(VerifyPhone)

  const resetState = useCallback(() => {
    setStep('phone')
    setPhoneDraft(savedPhone)
    setActivePhone('')
    setCode('')
    setError(null)
    setRateLimited(false)
  }, [savedPhone])

  const onModalRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !open) return
      setPhoneDraft(savedPhone || '')
      if (!savedPhone || isPhoneVerified(me)) {
        setStep('phone')
      }
    },
    [me, open, savedPhone],
  )

  const handleOpenChange = (next: boolean) => {
    if (!next) resetState()
    onOpenChange(next)
  }

  const saveAndSendCode = async () => {
    const trimmed = phoneDraft.trim()
    if (!trimmed) {
      setError('Enter your mobile number.')
      return
    }

    let e164 = trimmed
    try {
      e164 = toE164ForApi(trimmed)
    } catch {
      setError('Enter a valid UK mobile number (+44).')
      return
    }

    setError(null)
    try {
      if (e164 !== savedPhone) {
        const result = await updateMyProfile({
          variables: { input: { contactNumber: e164 } },
        })
        const updated = result.data?.updateMyProfile
        if (updated?.profile && me?.profile) {
          patchMe({
            profile: { ...me.profile, ...updated.profile },
            phoneVerified: updated.profile.phoneVerified,
            workerEligibility: updated.workerEligibility,
          })
        }
      }

      const result = await sendPhoneVerification({
        variables: { phone: e164 },
      })
      if (!result.data?.sendPhoneVerification) {
        throw new Error('Could not send verification code.')
      }

      setActivePhone(e164)
      setStep('code')
      setCode('')
      setRateLimited(false)
      trackFlowSucceeded(EVENTS.phone_verify_send_success)
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

  const confirmCode = async (submittedCode?: string) => {
    if (verifying) return

    const trimmed = (submittedCode ?? code).trim()
    if (!/^\d{6}$/.test(trimmed)) {
      setError('Enter the 6-digit code from your SMS.')
      return
    }

    if (submittedCode && submittedCode !== code) {
      setCode(submittedCode)
    }

    setError(null)
    try {
      const result = await verifyPhone({ variables: { code: trimmed } })
      if (!result.data?.verifyPhone) {
        throw new Error('Could not verify your phone number.')
      }
      await getUser()
      trackFlowSucceeded(EVENTS.phone_verify_success)
      showAppToast({
        title: 'Phone verified',
        description: 'Your phone number is now verified on your account.',
        type: 'success',
      })
      onVerified?.()
      handleOpenChange(false)
    } catch (e) {
      trackFlowFailed(EVENTS.phone_verify_fail, e, {
        flow: 'phone_verify',
        action: 'verifyPhone',
        operation: 'VerifyPhone',
      })
      setError(getFriendlyErrorMessage(e, 'That code did not work. Try again.'))
    }
  }

  const displayPhone = activePhone || savedPhone
  const maskedPhone = displayPhone
    ? maskPhoneForDisplay(formatPhoneForDisplay(displayPhone))
    : ''

  if (!me) return null

  return (
    <div ref={onModalRef}>
      {step === 'phone' ? (
        <Modal
          open={open}
          onOpenChange={handleOpenChange}
          title="Add contact phone number"
          cancelLabel="Cancel"
          submitLabel="Submit"
          onSubmit={() => void saveAndSendCode()}
          submitLoading={saving || sending}
          submitDisabled={rateLimited}
        >
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            Enter your contact phone number below to get verified.
          </Text>
          <FormField label="Mobile number">
            <PhoneInput
              value={phoneDraft}
              onChange={setPhoneDraft}
              aria-label="Mobile number"
            />
          </FormField>
          <Text fontSize="xs" color="formLabelMuted" lineHeight="tall">
            UK mobile numbers only (+44). We&apos;ll text you a 6-digit code to
            confirm this number on your account.
          </Text>
          {error ? (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          ) : null}
        </Modal>
      ) : (
        <Modal
          open={open}
          onOpenChange={handleOpenChange}
          title="Add contact phone number"
          backLabel="Back"
          onBack={() => {
            setStep('phone')
            setCode('')
            setError(null)
          }}
          submitLabel="Submit"
          onSubmit={() => void confirmCode()}
          submitLoading={verifying}
        >
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            To verify this mobile number, enter the 6-digit code we sent to{' '}
            <Text as="span" fontWeight={600} color="cardFg">
              {maskedPhone}
            </Text>
            .
          </Text>
          <Stack gap={2} align="center">
            <OtpInput
              key={activePhone || 'otp'}
              value={code}
              onChange={setCode}
              onEnter={(value) => {
                void confirmCode(value)
              }}
              onComplete={(value) => {
                void confirmCode(value)
              }}
            />
          </Stack>
          <Text fontSize="xs" color="formLabelMuted" lineHeight="tall">
            Codes are valid for 10 minutes. Didn&apos;t receive one?{' '}
            <button
              type="button"
              style={{
                font: 'inherit',
                fontWeight: 600,
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: rateLimited ? 'not-allowed' : 'pointer',
              }}
              disabled={rateLimited || sending}
              onClick={() => {
                if (!rateLimited && !sending) void saveAndSendCode()
              }}
            >
              Request a resend
            </button>
            .
          </Text>
          {error ? (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          ) : null}
        </Modal>
      )}
    </div>
  )
}
