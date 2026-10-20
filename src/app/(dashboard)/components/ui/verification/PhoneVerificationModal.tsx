'use client'

import { useMutation } from '@apollo/client/react'
import { Stack, Text } from '@chakra-ui/react'
import {
  LoginMethod,
  type SendPhoneVerificationMutation,
  type SendPhoneVerificationMutationVariables,
  type UpdateMyProfileMutation,
  type VerifyPhoneMutation,
} from '@codegen/schema'
import { useCallback, useState } from 'react'

import {
  isPhoneVerificationRateLimited,
  isPhoneVerified,
  isSamePhone,
  pendingPhoneChange,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import SendPhoneVerification from '@/app/(dashboard)/account/graphql/SendPhoneVerification.gql'
import VerifyPhone from '@/app/(dashboard)/account/graphql/VerifyPhone.gql'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import {
  formatPhoneForDisplay,
  maskPhoneForDisplay,
  toE164ForApi,
} from '@/utils/phoneNormalize'
import { FormField, Input, Modal, OtpInput, PhoneInput } from '@ui'

import bag from './i11n.json'
import { verificationErrorText } from './verificationError'

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
  const { cancel, phone: t, errors } = useI11n(bag)
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const getUser = useUserStore((s) => s.getUser)

  const savedPhone = profileContactNumber(me)
  // A verified number is changed through a pending number: it stays live
  // until the new one's code is approved (BE-71).
  const changing = isPhoneVerified(me)
  // Replacing a verified number re-auths: the password when the account has
  // one, otherwise the API wants a recent sign-in (REAUTH_REQUIRED).
  const needsPassword =
    changing && (me?.enabledLoginMethods ?? []).includes(LoginMethod.Password)
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [phoneDraft, setPhoneDraft] = useState('')
  const [activePhone, setActivePhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)

  const [updateMyProfile, { loading: saving }] =
    useMutation<UpdateMyProfileMutation>(UpdateMyProfile)
  const [sendPhoneVerification, { loading: sending }] = useMutation<
    SendPhoneVerificationMutation,
    SendPhoneVerificationMutationVariables
  >(SendPhoneVerification)
  const [verifyPhone, { loading: verifying }] =
    useMutation<VerifyPhoneMutation>(VerifyPhone)

  const resetState = useCallback(() => {
    setStep('phone')
    setPhoneDraft(savedPhone)
    setActivePhone('')
    setCode('')
    setPassword('')
    setError(null)
    setRateLimited(false)
  }, [savedPhone])

  const onModalRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !open) return
      const pending = pendingPhoneChange(me)
      if (pending) {
        setPhoneDraft(pending)
        setActivePhone(pending)
        setStep('code')
        return
      }
      setPhoneDraft(isPhoneVerified(me) ? '' : savedPhone || '')
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
      setError(t.needPhone)
      return
    }

    let e164 = trimmed
    try {
      e164 = toE164ForApi(trimmed)
    } catch {
      setError(t.invalidPhone)
      return
    }

    if (changing && isSamePhone(e164, savedPhone)) {
      setError(t.samePhone)
      return
    }
    if (needsPassword && !password) {
      setError(t.needPassword)
      return
    }

    setError(null)
    try {
      // Unverified numbers are still saved straight away.
      if (!changing && e164 !== savedPhone) {
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

      // First verification never sends a password.
      const result = await sendPhoneVerification({
        variables: needsPassword ? { phone: e164, password } : { phone: e164 },
      })
      if (!result.data?.sendPhoneVerification) throw new Error(t.sendFailed)

      if (changing) patchMe({ pendingPhone: e164 })
      setActivePhone(e164)
      setStep('code')
      setCode('')
      setRateLimited(false)
      trackFlowSucceeded(EVENTS.phone_verify_send_success, { change: changing })
    } catch (e) {
      trackFlowFailed(EVENTS.phone_verify_send_fail, e, {
        flow: 'phone_verify',
        action: 'sendPhoneVerification',
        operation: 'SendPhoneVerification',
        extra: { change: changing },
      })
      if (isPhoneVerificationRateLimited(e)) {
        setRateLimited(true)
      }
      setError(verificationErrorText(errors, e, t.sendFailed))
    }
  }

  const confirmCode = async (submittedCode?: string) => {
    if (verifying) return

    const trimmed = (submittedCode ?? code).trim()
    if (!/^\d{6}$/.test(trimmed)) {
      setError(t.needCode)
      return
    }

    if (submittedCode && submittedCode !== code) {
      setCode(submittedCode)
    }

    setError(null)
    try {
      const result = await verifyPhone({ variables: { code: trimmed } })
      if (!result.data?.verifyPhone) throw new Error(t.verifyFailed)
      await getUser()
      trackFlowSucceeded(EVENTS.phone_verify_success, { change: changing })
      showAppToast({
        title: changing ? t.changedTitle : t.verifiedTitle,
        description: changing ? t.changedBody : t.verifiedBody,
        type: 'success',
      })
      onVerified?.()
      handleOpenChange(false)
    } catch (e) {
      trackFlowFailed(EVENTS.phone_verify_fail, e, {
        flow: 'phone_verify',
        action: 'verifyPhone',
        operation: 'VerifyPhone',
        extra: { change: changing },
      })
      setError(verificationErrorText(errors, e, t.verifyFailed))
    }
  }

  const displayPhone = activePhone || savedPhone
  const maskedPhone = displayPhone
    ? maskPhoneForDisplay(formatPhoneForDisplay(displayPhone))
    : ''

  if (!me) return null

  const title = changing ? t.titleChange : t.titleAdd
  const [codeBefore, codeAfter = ''] = t.codeIntro.split('{phone}')

  return (
    <div ref={onModalRef}>
      {step === 'phone' ? (
        <Modal
          open={open}
          onOpenChange={handleOpenChange}
          title={title}
          cancelLabel={cancel}
          submitLabel={t.sendCode}
          onSubmit={() => void saveAndSendCode()}
          submitLoading={saving || sending}
          submitDisabled={rateLimited}
        >
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {changing ? t.introChange : t.introAdd}
          </Text>
          <FormField label={t.mobileNumber}>
            <PhoneInput
              value={phoneDraft}
              onChange={setPhoneDraft}
              aria-label={t.mobileNumber}
            />
          </FormField>
          <Text fontSize="xs" color="text.muted" lineHeight="tall">
            {t.ukOnly}
          </Text>
          {needsPassword ? (
            <FormField label={t.currentPassword} helperText={t.passwordHelp}>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
          ) : null}
          {error ? (
            <Text color="status.danger.fg" fontSize="sm">
              {error}
            </Text>
          ) : null}
        </Modal>
      ) : (
        <Modal
          open={open}
          onOpenChange={handleOpenChange}
          title={title}
          backLabel={t.back}
          onBack={() => {
            setStep('phone')
            setCode('')
            setError(null)
          }}
          submitLabel={t.verify}
          onSubmit={() => void confirmCode()}
          submitLoading={verifying}
        >
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {codeBefore}
            <Text as="span" fontWeight={600} color="text.default">
              {maskedPhone}
            </Text>
            {codeAfter}
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
          <Text fontSize="xs" color="text.muted" lineHeight="tall">
            {t.codeHelp}{' '}
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
              {t.resendCode}
            </button>
          </Text>
          {error ? (
            <Text color="status.danger.fg" fontSize="sm">
              {error}
            </Text>
          ) : null}
        </Modal>
      )}
    </div>
  )
}
