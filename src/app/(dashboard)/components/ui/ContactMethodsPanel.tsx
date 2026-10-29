'use client'

import { Stack, Text } from '@chakra-ui/react'

import {
  hasVerifiedContactMethod,
  isPhoneVerified,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { FormStack } from '@ui'

import { ContactRows } from './contact/ContactRows'
import bag from './contact/i11n.json'

type ContactMethodsPanelProps = {
  showIntro?: boolean
  /**
   * Readiness requires a verified PHONE, not just any contact method.
   * Worker setup uses this: the BE requires a strictly verified phone to
   * finish setup and send quotes (2026-07-13).
   */
  requirePhone?: boolean
  onContactUpdated?: () => void
}

/**
 * Worker setup's contact step: the contact rows plus whether you can go on.
 *
 * Form spacing (FE-481): the intro is a lead-in to the rows, `labelToControl`
 * (8) above them; the readiness line is a status line, a field group 20 under
 * the rows.
 */
export function ContactMethodsPanel({
  showIntro = true,
  requirePhone = false,
  onContactUpdated,
}: ContactMethodsPanelProps) {
  const t = useI11n(bag).panel
  const me = useUserStore((s) => s.me)
  if (!me) return null

  const ready = requirePhone
    ? isPhoneVerified(me)
    : hasVerifiedContactMethod(me)

  return (
    <FormStack>
      <Stack gap="form.labelToControl">
        {showIntro ? (
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {t.intro}
          </Text>
        ) : null}

        <ContactRows onContactUpdated={onContactUpdated} />
      </Stack>

      {ready ? (
        <Text fontSize="sm" fontWeight={500} color="text.link">
          {requirePhone ? t.readyPhone : t.readyAny}
        </Text>
      ) : (
        <Text fontSize="sm" color="text.muted">
          {requirePhone ? t.needPhone : t.needAny}
        </Text>
      )}
    </FormStack>
  )
}
