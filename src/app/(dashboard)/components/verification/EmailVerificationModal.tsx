'use client'

import { Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import { Link, Modal } from '@ui'

type EmailVerificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContactUpdated?: () => void
}

export function EmailVerificationModal({
  open,
  onOpenChange,
  onContactUpdated,
}: EmailVerificationModalProps) {
  const me = useUserStore((s) => s.me)
  const { resend, isSending, message, isSent, reset } =
    useResendVerificationEmail()

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleResend = async () => {
    const ok = await resend()
    if (ok) onContactUpdated?.()
  }

  const onModalRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !open) return
      reset()
    },
    [open, reset],
  )

  if (!me) return null

  const verified = isEmailVerified(me)

  return (
    <div ref={onModalRef}>
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title="Verify your email"
        cancelLabel="Cancel"
        submitLabel={verified ? undefined : 'Resend email'}
        onSubmit={verified ? undefined : () => void handleResend()}
        submitLoading={isSending}
        hideFooter={verified}
      >
        {verified ? (
          <Text fontSize="sm" color="text.link" fontWeight={600}>
            Your email is verified.
          </Text>
        ) : (
          <>
            <Text fontSize="sm" color="text.muted" lineHeight="tall">
              We&apos;ll send a verification link to{' '}
              <Text as="span" fontWeight={600} color="text.default">
                {me.email}
              </Text>
              . Open the link in your inbox to confirm this address on your
              account — you cannot verify a different email.
            </Text>
            {message ? (
              <Text
                fontSize="sm"
                color={isSent ? 'text.link' : 'status.danger.fg'}
              >
                {message}
              </Text>
            ) : null}
            <Link
              href={'/verify-email/sent'}
              fontSize="sm"
              fontWeight={600}
              color="text.link"
              _hover={{ textDecoration: 'none', color: 'action.primaryHover' }}
            >
              Check inbox
            </Link>
          </>
        )}
      </Modal>
    </div>
  )
}
