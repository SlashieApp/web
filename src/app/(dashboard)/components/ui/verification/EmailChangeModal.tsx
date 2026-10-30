'use client'

import { useMutation } from '@apollo/client/react'
import { Text } from '@chakra-ui/react'
import type { RequestEmailChangeMutation } from '@codegen/schema'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import RequestEmailChange from '@/app/(dashboard)/account/graphql/RequestEmailChange.gql'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { FormField, FormStack, Input, Modal } from '@ui'

import { focusFirstInvalid } from './focusFirstInvalid'
import bag from './i11n.json'
import { verificationErrorText } from './verificationError'

type EmailChangeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequested?: () => void
}

/**
 * Starts an email change (BE-71): the current password, then a link to the new
 * address. `me.email` stays live until that link is opened. A check that
 * belongs to one field (not an address, the same address, no password) is that
 * field's error, 4 under it, with focus moved there; the line under the fields
 * is only for a failed request.
 */
export function EmailChangeModal({
  open,
  onOpenChange,
  onRequested,
}: EmailChangeModalProps) {
  const { cancel, change: t, errors } = useI11n(bag)
  const me = useUserStore((s) => s.me)
  const getUser = useUserStore((s) => s.getUser)
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [error, setError] = useState<string | null>(null)

  const [requestEmailChange, { loading }] =
    useMutation<RequestEmailChangeMutation>(RequestEmailChange)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setNewEmail('')
      setPassword('')
      setFieldErrors({})
      setError(null)
    }
    onOpenChange(next)
  }

  const submit = async () => {
    const email = newEmail.trim().toLowerCase()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: t.invalidEmail })
      focusFirstInvalid()
      return
    }
    if (email === me?.email.trim().toLowerCase()) {
      setFieldErrors({ email: t.sameEmail })
      focusFirstInvalid()
      return
    }
    if (!password) {
      setFieldErrors({ password: t.needPassword })
      focusFirstInvalid()
      return
    }

    setFieldErrors({})
    try {
      const result = await requestEmailChange({
        variables: { newEmail: email, password },
      })
      if (!result.data?.requestEmailChange) throw new Error(t.failed)
      await getUser()
      trackFlowSucceeded(EVENTS.email_change_request_success)
      showAppToast({
        title: t.sentTitle,
        description: formatMessage(t.sentBody, { email }),
        type: 'success',
      })
      onRequested?.()
      handleOpenChange(false)
    } catch (e) {
      trackFlowFailed(EVENTS.email_change_request_fail, e, {
        flow: 'email_change',
        action: 'requestEmailChange',
        operation: 'RequestEmailChange',
      })
      setError(verificationErrorText(errors, e, t.failed))
    }
  }

  if (!me) return null

  const [before, after = ''] = t.body.split('{email}')

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t.title}
      description={
        <>
          {before}
          <Text as="span" fontWeight={600} color="text.default">
            {me.email}
          </Text>
          {after}
        </>
      }
      cancelLabel={cancel}
      submitLabel={t.submit}
      onSubmit={() => void submit()}
      submitLoading={loading}
    >
      <FormStack>
        <FormField label={t.newEmail} errorText={fieldErrors.email}>
          <Input
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value)
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: undefined }))
              }
            }}
          />
        </FormField>
        <FormField label={t.currentPassword} errorText={fieldErrors.password}>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) {
                setFieldErrors((current) => ({
                  ...current,
                  password: undefined,
                }))
              }
            }}
          />
        </FormField>
        {error ? (
          <Text color="status.danger.fg" fontSize="sm" role="alert">
            {error}
          </Text>
        ) : null}
      </FormStack>
    </Modal>
  )
}
