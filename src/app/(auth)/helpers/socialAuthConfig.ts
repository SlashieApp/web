import { isAppleAuthConfigured } from './appleAuthConfig'
import { isGoogleAuthConfigured } from './googleAuthConfig'

/**
 * Google or Apple sign-in is set up. The "Or continue with" divider and the
 * buttons under it show together, so a form never ends on a divider with
 * nothing below it.
 */
export function isSocialAuthConfigured(): boolean {
  return isGoogleAuthConfigured() || isAppleAuthConfigured()
}
