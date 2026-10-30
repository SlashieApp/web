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
import { useCallback, useId, useState } from 'react'

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
import {
  FormErrorText,
  FormField,
  FormStack,
  Input,
  Modal,
  OtpInput,
  PhoneInput,
  formControlHelperTextProps,
} from '@ui'

import { focusFirstInvalid } from './focusFirstInvalid'
import bag from './i11n.json'
import { verificationErrorText } from './verificationError'

type PhoneVerificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified?: () => void
}

type Step = 'phone' | 'code'

/** A check that belongs to one field is that field's error; the rest is `error`. */
type FieldErrors = { phone?: string; password?: string; code?: string }

/**
 * The number step's number and password, and the code step's six digits: each
 * check that fails is its field's error, 4 under it, with focus moved there.
 * The line under the fields is for a failed request. A Resend on the code step
 * runs the number and password checks with neither field on screen, so there
 * they stay the error line.
 */

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  // The code step has no label: its lead-in names the group, and its help line
  // and error describe it.
  const codeLeadId = useId()
  const codeHelpId = useId()
  const codeErrorId = useId()
  const clearFieldError = (key: keyof FieldErrors) =>
    setFieldErrors((current) =>
      current[key] ? { ...current, [key]: undefined } : current,
    )

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
    setFieldErrors({})
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
    setError(null)
    const reject = (field: 'phone' | 'password', message: string) => {
      if (step === 'phone') {
        setFieldErrors({ [field]: message })
        focusFirstInvalid()
      } else {
        setError(message)
      }
    }

    const trimmed = phoneDraft.trim()
    if (!trimmed) {
      reject('phone', t.needPhone)
      return
    }

    let e164 = trimmed
    try {
      e164 = toE164ForApi(trimmed)
    } catch {
      reject('phone', t.invalidPhone)
      return
    }

    if (changing && isSamePhone(e164, savedPhone)) {
      reject('phone', t.samePhone)
      return
    }
    if (needsPassword && !password) {
      reject('password', t.needPassword)
      return
    }

    setFieldErrors({})
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
    setError(null)
    if (!/^\d{6}$/.test(trimmed)) {
      setFieldErrors({ code: t.needCode })
      focusFirstInvalid()
      return
    }

    if (submittedCode && submittedCode !== code) {
      setCode(submittedCode)
    }

    setFieldErrors({})
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
          description={changing ? t.introChange : t.introAdd}
          cancelLabel={cancel}
          submitLabel={t.sendCode}
          onSubmit={() => void saveAndSendCode()}
          submitLoading={saving || sending}
          submitDisabled={rateLimited}
        >
          <FormStack>
            <FormField
              label={t.mobileNumber}
              helperText={t.ukOnly}
              errorText={fieldErrors.phone}
            >
              <PhoneInput
                value={phoneDraft}
                onChange={(next) => {
                  setPhoneDraft(next)
                  clearFieldError('phone')
                }}
                aria-label={t.mobileNumber}
              />
            </FormField>
            {needsPassword ? (
              <FormField
                label={t.currentPassword}
                helperText={t.passwordHelp}
                errorText={fieldErrors.password}
              >
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearFieldError('password')
                  }}
                />
              </FormField>
            ) : null}
            {error ? (
              <Text color="status.danger.fg" fontSize="sm" role="alert">
                {error}
              </Text>
            ) : null}
          </FormStack>
        </Modal>
      ) : (
        <Modal
          open={open}
          onOpenChange={handleOpenChange}
          title={title}
          description={
            <span id={codeLeadId}>
              {codeBefore}
              <Text as="span" fontWeight={600} color="text.default">
                {maskedPhone}
              </Text>
              {codeAfter}
            </span>
          }
          backLabel={t.back}
          onBack={() => {
            setStep('phone')
            setCode('')
            setFieldErrors({})
            setError(null)
          }}
          submitLabel={t.verify}
          onSubmit={() => void confirmCode()}
          submitLoading={verifying}
        >
          <FormStack>
            {/* The code has no label of its own: the description above names
                the group and says what to enter. Its help line sits 4 under
                the boxes, like a helper under any control, and its error 4
                under that, as a field's does. */}
            <div>
              <OtpInput
                key={activePhone || 'otp'}
                value={code}
                onChange={(next) => {
                  setCode(next)
                  clearFieldError('code')
                }}
                aria-labelledby={codeLeadId}
                aria-describedby={
                  fieldErrors.code ? `${codeHelpId} ${codeErrorId}` : codeHelpId
                }
                invalid={Boolean(fieldErrors.code)}
                onEnter={(value) => {
                  void confirmCode(value)
                }}
                onComplete={(value) => {
                  void confirmCode(value)
                }}
              />
              <Stack gap="form.helperGap" mt="form.controlToHelper" w="full">
                <Text id={codeHelpId} px={1} {...formControlHelperTextProps}>
                  {t.codeHelp}{' '}
                  <button
                    type="button"
                    style={{
                      font: 'inherit',
                      fontWeight: 500,
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
                {fieldErrors.code ? (
                  <FormErrorText id={codeErrorId}>
                    {fieldErrors.code}
                  </FormErrorText>
                ) : null}
              </Stack>
            </div>
            {error ? (
              <Text color="status.danger.fg" fontSize="sm" role="alert">
                {error}
              </Text>
            ) : null}
          </FormStack>
        </Modal>
      )}
    </div>
  )
}
