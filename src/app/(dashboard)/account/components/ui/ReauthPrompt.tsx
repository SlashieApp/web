'use client'

import { Stack, Text } from '@chakra-ui/react'
import { LoginMethod } from '@codegen/schema'
import type { ReactNode } from 'react'

import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import { FormAlternatives } from '@ui'

export type ReauthPromptProps = {
  /** Why the sign-in is needed: the sentence above the buttons. */
  children: ReactNode
  /** The account's sign-in methods: a button for each of Google and Apple it has. */
  enabledLoginMethods: readonly LoginMethod[]
  /** Where the provider sends the user back to. */
  next: string
  /** Runs when the user signed in again in place (same page). */
  onSignedIn?: () => void
}

/**
 * "Sign in again first" in an account dialog (set a password, delete account):
 * a sentence, then Google and Apple 8 apart (`formSpace.alternativesGap`), both
 * 48 tall. The sentence introduces the buttons, so it sits where a label would,
 * `formSpace.labelToControl` (8) above them.
 *
 * There is no "Or continue with" divider: that divider follows the main button,
 * and here the buttons come before it. The main button is in the dialog's bar,
 * disabled until the user has signed in again.
 */
export function ReauthPrompt({
  children,
  enabledLoginMethods,
  next,
  onSignedIn,
}: ReauthPromptProps) {
  return (
    <Stack gap="form.labelToControl">
      <Text fontSize="sm">{children}</Text>
      <FormAlternatives>
        {enabledLoginMethods.includes(LoginMethod.Google) ? (
          <GoogleAuthButton next={next} onSignedIn={onSignedIn} />
        ) : null}
        {enabledLoginMethods.includes(LoginMethod.Apple) ? (
          <AppleAuthButton next={next} onSignedIn={onSignedIn} />
        ) : null}
      </FormAlternatives>
    </Stack>
  )
}
