'use client'

import { Box } from '@chakra-ui/react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useMe } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import bag from '../i11n.json'
import { AccountNotice } from './AccountNotice'

/**
 * Above every page while your email is unverified: why it matters, then Check
 * inbox and Resend email under the text (FE-541, FE-477: in English and
 * Chinese). Drawn as an `AccountNotice`, like the suspended notice.
 */
export function EmailVerificationBanner() {
  const copy = useI11n(bag)
  const t = copy.verifyBanner
  const me = useMe()
  const { resend, isSending, isSent, failure } = useResendVerificationEmail()

  if (!me || isEmailVerified(me)) return null

  const outcome = isSent
    ? copy.resend.sent
    : failure
      ? copy.resend[failure]
      : null

  return (
    <AccountNotice
      announce="status"
      ariaLabel={t.ariaLabel}
      data-verify-banner=""
      actions={
        <>
          <Link
            href="/verify-email/sent"
            fontSize="sm"
            fontWeight={500}
            color="text.link"
            _hover={{ color: 'status.success.fg', textDecoration: 'none' }}
          >
            {t.checkInbox}
          </Link>
          <Button
            size="xs"
            variant="secondary"
            loading={isSending}
            onClick={() => void resend()}
          >
            {t.resend}
          </Button>
          {outcome ? (
            <Box
              as="output"
              fontSize="xs"
              color={isSent ? 'status.success.fg' : 'status.danger.fg'}
            >
              {outcome}
            </Box>
          ) : null}
        </>
      }
    >
      {t.text}
    </AccountNotice>
  )
}
