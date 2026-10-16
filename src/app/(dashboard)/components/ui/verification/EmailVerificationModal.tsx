'use client'

import { Text } from '@chakra-ui/react'
import { useCallback } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { Link, Modal } from '@ui'

import bag from './i11n.json'

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
  const { cancel, email: t } = useI11n(bag)
  const me = useUserStore((s) => s.me)
  const { resend, isSending, isSent, failure, reset } =
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
  const [before, after = ''] = t.body.split('{email}')
  const status = isSent
    ? t.sent
    : failure
      ? failure === 'tooSoon'
        ? t.tooSoon
        : t.failed
      : null

  return (
    <div ref={onModalRef}>
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={t.title}
        cancelLabel={cancel}
        submitLabel={verified ? undefined : t.resend}
        onSubmit={verified ? undefined : () => void handleResend()}
        submitLoading={isSending}
        hideFooter={verified}
      >
        {verified ? (
          <Text fontSize="sm" color="text.link" fontWeight={600}>
            {t.verified}
          </Text>
        ) : (
          <>
            <Text fontSize="sm" color="text.muted" lineHeight="tall">
              {before}
              <Text as="span" fontWeight={600} color="text.default">
                {me.email}
              </Text>
              {after}
            </Text>
            {status ? (
              <Text
                fontSize="sm"
                color={isSent ? 'text.link' : 'status.danger.fg'}
              >
                {status}
              </Text>
            ) : null}
            <Link
              href={'/verify-email/sent'}
              fontSize="sm"
              fontWeight={600}
              color="text.link"
              _hover={{ textDecoration: 'none', color: 'action.primaryHover' }}
            >
              {t.checkInbox}
            </Link>
          </>
        )}
      </Modal>
    </div>
  )
}
