'use client'

import { Box } from '@chakra-ui/react'
import { type ReactNode, useEffect, useState } from 'react'
import { LuMail } from 'react-icons/lu'

import authBag from '@/app/(auth)/components/i11n.json'
import { readLastSignIn } from '@/app/(auth)/helpers/lastSignIn'
import { socialButtonPx } from '@/app/(auth)/helpers/socialButton'
import { useI11n } from '@/i18n/useI11n'
import { FormAlternatives, FormDivider } from '@ui'

import { GoogleStyleButton } from './GoogleStyleButton'

export const EMAIL_SECTION_ID = 'auth-email-section'

/**
 * Whether the email section is open (FE-563). Open from the start when the
 * page brings an email or a failed try (`openNow`), or, once mounted, when
 * this browser last signed in with email; otherwise it opens on the button.
 * The stored method is read after mount, so the server and the first client
 * render agree.
 */
export function useEmailSection(openNow: boolean) {
  const [open, setOpen] = useState(openNow)
  const [openedByTap, setOpenedByTap] = useState(false)
  useEffect(() => {
    if (openNow) setOpen(true)
  }, [openNow])
  useEffect(() => {
    if (readLastSignIn() === 'email') setOpen(true)
  }, [])
  return {
    open,
    /** True once the person tapped the button: move focus into the form. */
    openedByTap,
    expand: () => {
      setOpen(true)
      setOpenedByTap(true)
    },
  }
}

/**
 * Log in and Sign up's ways in (FE-563, Ryan 13 Nov): Google, Apple and
 * Continue with email as one stack of equal outlined buttons. Continue with
 * email turns into the email section in place: a divider, then the form.
 */
export function AuthOptions({
  social,
  open,
  onExpand,
  children,
}: {
  /** Google and Apple, when configured. */
  social: ReactNode | null
  open: boolean
  onExpand: () => void
  /** The email form. */
  children: ReactNode
}) {
  const t = useI11n(authBag).emailOption
  // Without Google and Apple there is nothing to choose: the form shows.
  if (!social) return <>{children}</>
  return (
    <Box w="full">
      <FormAlternatives>
        {social}
        {open ? null : (
          <GoogleStyleButton
            label={t.continue}
            onClick={onExpand}
            aria-expanded={false}
            aria-controls={EMAIL_SECTION_ID}
            data-email-option=""
            icon={
              <LuMail
                size={socialButtonPx(18)}
                color="#3c4043"
                aria-hidden
                style={{ flexShrink: 0 }}
              />
            }
          />
        )}
      </FormAlternatives>
      {open ? (
        <Box id={EMAIL_SECTION_ID} data-email-section="">
          <FormDivider mt="form.dividerToAlternatives">{t.divider}</FormDivider>
          {children}
        </Box>
      ) : null}
    </Box>
  )
}
