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
import { FormField, Input, Modal } from '@ui'

import bag from './i11n.json'
import { verificationErrorText } from './verificationError'

type EmailChangeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequested?: () => void
}

/**
 * Starts an email change (BE-71): the current password, then a link to the new
 * address. `me.email` stays live until that link is opened.
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
  const [error, setError] = useState<string | null>(null)

  const [requestEmailChange, { loading }] =
    useMutation<RequestEmailChangeMutation>(RequestEmailChange)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setNewEmail('')
      setPassword('')
      setError(null)
    }
    onOpenChange(next)
  }

  const submit = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.invalidEmail)
      return
    }
    if (email === me?.email.trim().toLowerCase()) {
      setError(t.sameEmail)
      return
    }
    if (!password) {
      setError(t.needPassword)
      return
    }

    setError(null)
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
      cancelLabel={cancel}
      submitLabel={t.submit}
      onSubmit={() => void submit()}
      submitLoading={loading}
    >
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {before}
        <Text as="span" fontWeight={600} color="text.default">
          {me.email}
        </Text>
        {after}
      </Text>
      <FormField label={t.newEmail}>
        <Input
          type="email"
          autoComplete="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </FormField>
      <FormField label={t.currentPassword}>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      {error ? (
        <Text color="status.danger.fg" fontSize="sm" role="alert">
          {error}
        </Text>
      ) : null}
    </Modal>
  )
}
