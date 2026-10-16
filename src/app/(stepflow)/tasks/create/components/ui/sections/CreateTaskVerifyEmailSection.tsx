'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuMailCheck } from 'react-icons/lu'

import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, InfoBar } from '@ui'

import bag from '../../../i11n.json'

export type CreateTaskVerifyEmailSectionProps = {
  email: string
  /** Re-reads the account; resolves true once the email is verified. */
  onCheck: () => Promise<boolean>
  checking: boolean
  /** The last check found the email still unverified. */
  stillUnverified: boolean
}

/**
 * Review step, unverified email (FE-295): posting needs a verified email, so
 * say so before Post task, with Resend and a re-check after the reader clicks
 * the link (in any tab).
 */
export function CreateTaskVerifyEmailSection({
  email,
  onCheck,
  checking,
  stillUnverified,
}: CreateTaskVerifyEmailSectionProps) {
  const v = useI11n(bag).verify
  const { resend, isSending, isSent, message } = useResendVerificationEmail()

  return (
    <Stack gap={3}>
      <InfoBar
        tone="warning"
        icon={<LuMailCheck size={20} />}
        heading={v.title}
        hideBadge
      >
        {formatMessage(v.body, { email })}
      </InfoBar>
      <HStack gap={2} flexWrap="wrap">
        <Button
          type="button"
          variant="primary"
          loading={checking}
          onClick={() => void onCheck()}
        >
          {v.verified}
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={isSending}
          onClick={() => void resend()}
        >
          {v.resend}
        </Button>
      </HStack>
      {stillUnverified ? (
        <Text fontSize="sm" color="status.danger.fg" role="alert">
          {v.notYet}
        </Text>
      ) : null}
      {message ? (
        <Box
          as="output"
          fontSize="sm"
          color={isSent ? 'status.success.fg' : 'status.danger.fg'}
        >
          {message}
        </Box>
      ) : null}
    </Stack>
  )
}
