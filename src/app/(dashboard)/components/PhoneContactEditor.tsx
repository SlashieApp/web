'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Text } from '@chakra-ui/react'
import type { UpdateMyProfileMutation } from '@codegen/schema'
import { useCallback, useRef, useState } from 'react'

import {
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { PhoneVerificationBlock } from '@/app/(dashboard)/components/PhoneVerificationBlock'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import { captureApiError } from '@/lib/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { formatPhoneForDisplay, toE164ForApi } from '@/utils/phoneNormalize'
import { Button, FormField, PhoneInput } from '@ui'

type PhoneContactEditorProps = {
  /** Hide the verify sub-heading (account card embed). */
  compact?: boolean
}

export function PhoneContactEditor({
  compact = false,
}: PhoneContactEditorProps) {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const savedPhone = profileContactNumber(me)
  const [phoneDraft, setPhoneDraft] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [verifyResetKey, setVerifyResetKey] = useState('')
  const draftSyncedRef = useRef('')

  const [updateMyProfile, { loading: saving }] =
    useMutation<UpdateMyProfileMutation>(UpdateMyProfile)

  const onEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !savedPhone || draftSyncedRef.current === savedPhone) return
      draftSyncedRef.current = savedPhone
      setPhoneDraft(savedPhone)
    },
    [savedPhone],
  )

  if (!me) return null

  const phoneDirty = phoneDraft.trim() !== savedPhone
  const verified = isPhoneVerified(me)

  const savePhone = async () => {
    const trimmed = phoneDraft.trim()
    if (!trimmed) {
      setSaveError('Enter your mobile number.')
      return
    }
    let e164 = trimmed
    try {
      e164 = toE164ForApi(trimmed)
    } catch {
      setSaveError('Enter a valid UK mobile number (+44).')
      return
    }
    setSaveError(null)
    setSaveSuccess(null)
    try {
      const result = await updateMyProfile({
        variables: { input: { contactNumber: e164 } },
      })
      const updated = result.data?.updateMyProfile
      if (updated?.profile && me.profile) {
        patchMe({
          profile: { ...me.profile, ...updated.profile },
          phoneVerified: updated.profile.phoneVerified,
          workerEligibility: updated.workerEligibility,
        })
      }
      draftSyncedRef.current = e164
      setPhoneDraft(e164)
      setVerifyResetKey(e164)
      setSaveSuccess('Phone saved. Request a verification code when ready.')
    } catch (e) {
      captureApiError(e, {
        flow: 'phone_verify',
        action: 'savePhone',
        source: 'graphql',
        url_or_operation: 'UpdateMyProfile',
        route: '/profile',
        report_global: false,
      })
      setSaveError(
        getFriendlyErrorMessage(e, 'Could not save your phone number.'),
      )
    }
  }

  return (
    <Stack ref={onEditorRef} gap={3}>
      <FormField
        label="Mobile number"
        helperText="UK mobile numbers only (+44). Saving a new number resets verification."
      >
        <PhoneInput
          value={phoneDraft}
          onChange={(next) => {
            setPhoneDraft(next)
            setSaveSuccess(null)
          }}
          aria-label="Mobile number"
        />
      </FormField>

      <HStack gap={3} flexWrap="wrap">
        <Button
          size="sm"
          variant="primary"
          onClick={() => void savePhone()}
          loading={saving}
          disabled={!phoneDirty}
        >
          Save phone
        </Button>
        {savedPhone ? (
          <Text fontSize="sm" color="formLabelMuted">
            Saved: {formatPhoneForDisplay(savedPhone)}
            {verified ? ' · Verified' : ' · Not verified'}
          </Text>
        ) : null}
      </HStack>

      {saveError ? (
        <Text color="red.500" fontSize="sm">
          {saveError}
        </Text>
      ) : null}
      {saveSuccess ? (
        <Text color="primary.700" fontSize="sm">
          {saveSuccess}
        </Text>
      ) : null}

      <PhoneVerificationBlock
        compact={compact}
        profilePhoneDirty={phoneDirty}
        resetKey={verifyResetKey}
      />
    </Stack>
  )
}
