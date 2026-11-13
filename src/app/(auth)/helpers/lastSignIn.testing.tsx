import type { Decorator } from '@storybook/nextjs-vite'

import { StorySeed } from './authStoryDecorator'
import { LAST_SIGN_IN_KEY, type SignInMethod } from './lastSignIn'

/**
 * Story-only: how this browser last signed in (FE-563). `'email'` opens the
 * email section at once, as for a returning email user; `null` is a first
 * visit, so Google, Apple and Continue with email show closed.
 */
export const withLastSignIn =
  (method: SignInMethod | null): Decorator =>
  (Story) => (
    <StorySeed
      apply={() => {
        try {
          if (method) window.localStorage.setItem(LAST_SIGN_IN_KEY, method)
          else window.localStorage.removeItem(LAST_SIGN_IN_KEY)
        } catch {
          // Storage blocked: the section starts closed.
        }
      }}
      reset={() => {
        try {
          window.localStorage.removeItem(LAST_SIGN_IN_KEY)
        } catch {
          // Nothing to undo.
        }
      }}
    >
      <Story />
    </StorySeed>
  )
