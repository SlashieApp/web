'use client'

import { useMutation } from '@apollo/client/react'
import { Text } from '@chakra-ui/react'
import type { RequestEmailChangeMutation } from '@codegen/schema'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import RequestEmailChange from '@/app/(dashboard)/account/graphql/RequestEmailChange.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import {
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
} from '@/utils/graphqlErrors'
import { FormField, Input, Modal } from '@ui'

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
      setError('Enter a valid email address.')
      return
    }
    if (email === me?.email.trim().toLowerCase()) {
      setError("That's already your email.")
      return
    }
    if (!password) {
      setError('Enter your current password.')
      return
    }

    setError(null)
    try {
      const result = await requestEmailChange({
        variables: { newEmail: email, password },
      })
      if (!result.data?.requestEmailChange) {
        throw new Error('Could not start the email change.')
      }
      await getUser()
      trackFlowSucceeded(EVENTS.email_change_request_success)
      showAppToast({
        title: 'Check your new inbox',
        description: `We sent a link to ${email}. Your email changes once you open it.`,
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
      setError(
        getGraphQLErrorCode(e) === 'INVALID_CREDENTIALS'
          ? 'That password is incorrect.'
          : getFriendlyErrorMessage(e, 'Could not start the email change.'),
      )
    }
  }

  if (!me) return null

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Change email"
      cancelLabel="Cancel"
      submitLabel="Send link"
      onSubmit={() => void submit()}
      submitLoading={loading}
    >
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        We&apos;ll email a link to your new address.{' '}
        <Text as="span" fontWeight={600} color="text.default">
          {me.email}
        </Text>{' '}
        stays on your account until you open it, and we&apos;ll let that address
        know about the change.
      </Text>
      <FormField label="New email">
        <Input
          type="email"
          autoComplete="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Current password">
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
