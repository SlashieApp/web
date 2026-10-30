'use client'

import { chakra } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaApple } from 'react-icons/fa'

import {
  type AppleCredential,
  type AppleSignInResponse,
  appleCredentialFromResponse,
  appleScriptLocale,
  getAppleClientId,
  getAppleRedirectUri,
  isAppleAuthConfigured,
} from '@/app/(auth)/helpers/appleAuthConfig'
import {
  type AppleNonce,
  createAppleNonce,
} from '@/app/(auth)/helpers/appleNonce'
import {
  type AuthRedirectIntent,
  resolvePostAuthRedirect,
} from '@/app/(auth)/helpers/authRedirect'
import { socialButtonPx } from '@/app/(auth)/helpers/socialButton'
import { useUserStore } from '@/app/(auth)/store/user'
import { useLocale } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { APP_HOME } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

import bag from '../i11n.json'

type AppleClientConfig = {
  clientId: string
  scope: string
  redirectURI: string
  usePopup: boolean
  /** SHA-256 hex of the raw nonce; Apple copies it into the identity token. */
  nonce?: string
}

type AppleIdAuth = {
  init: (config: AppleClientConfig) => void
  /** A config here overrides `init` for this one sign-in. */
  signIn: (config?: AppleClientConfig) => Promise<AppleSignInResponse>
}

declare global {
  interface Window {
    AppleID?: { auth: AppleIdAuth }
  }
}

let appleScript: Promise<void> | null = null

/** Apple's Sign in with Apple JS, loaded once per page. */
function loadAppleScript(locale: string): Promise<void> {
  if (window.AppleID) return Promise.resolve()
  if (appleScript) return appleScript
  appleScript = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${locale}/appleid.auth.js`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      appleScript = null
      reject(new Error('Apple sign-in script failed to load'))
    }
    document.head.appendChild(script)
  })
  return appleScript
}

/**
 * Google's outline button, matched exactly: their widget can't be restyled (it
 * provides the ID token the API verifies), so Apple follows it. Apple's
 * guidelines allow this white, outlined style. The colours are Google's
 * fixed values, not theme tokens: their widget stays white in dark mode too.
 * Google's button is scaled to the form control height (48), so Apple is built
 * at 48 with the same scale on its padding, text and logo.
 */
export function AppleSignInButton({
  label,
  disabled = false,
  describedBy,
  onClick,
}: {
  label: string
  disabled?: boolean
  /** The id of the text that explains the button (why it is blocked). */
  describedBy?: string
  onClick: () => void
}) {
  return (
    <chakra.button
      type="button"
      aria-describedby={describedBy}
      w="full"
      maxW="400px"
      h="form.controlHeight"
      px={`${socialButtonPx(12)}px`}
      display="flex"
      alignItems="center"
      gap={`${socialButtonPx(8)}px`}
      borderRadius="full"
      borderWidth="1px"
      borderColor="#dadce0"
      bg="white"
      color="#3c4043"
      fontFamily='"Google Sans", arial, sans-serif'
      fontSize={`${socialButtonPx(14)}px`}
      fontWeight={500}
      letterSpacing={`${socialButtonPx(0.25)}px`}
      cursor="pointer"
      transition="background-color 0.218s, border-color 0.218s"
      _hover={{ bg: '#f8faff', borderColor: '#d2e3fc' }}
      disabled={disabled}
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
      _focusVisible={sdlFocusRing}
      onClick={onClick}
    >
      <FaApple
        size={socialButtonPx(18)}
        color="#000"
        aria-hidden
        style={{ flexShrink: 0 }}
      />
      {/* Centred in the space after the logo, like Google's label. */}
      <chakra.span flex={1} textAlign="center">
        {label}
      </chakra.span>
    </chakra.button>
  )
}

type AppleAuthButtonProps = {
  intent?: AuthRedirectIntent | null
  next?: string | null
  fallbackPath?: string
  /**
   * When true, a press shows the consent prompt instead, so a new account
   * cannot be created without the register-page checkboxes.
   */
  blocked?: boolean
  onBlocked?: () => void
  /** The id of the text that says why the button is blocked (sign up's hint). */
  describedBy?: string
  /** Runs after sign-in succeeds, before the redirect (e.g. sign-up opt-ins). */
  onSignedIn?: () => Promise<void> | void
  /**
   * Link mode: hands over Apple's credential instead of signing in, so the
   * session and redirect stay as they are (Account → link Apple).
   */
  onToken?: (credential: AppleCredential) => Promise<void> | void
  /** Hold the button while the caller is busy (link mode). */
  busy?: boolean
}

/**
 * Sign in with Apple (FE-63): Apple JS popup → identity token →
 * `loginWithMethod(APPLE)`, then the same session + redirect as Google.
 * Every attempt sends Apple the SHA-256 of a fresh nonce and the API the raw
 * one, plus Apple's one-time code when there is one. With `onToken` it only
 * hands the credential over. Hidden until `NEXT_PUBLIC_APPLE_CLIENT_ID` is set.
 */
export function AppleAuthButton({
  intent = null,
  next = null,
  fallbackPath = APP_HOME,
  blocked = false,
  onBlocked,
  describedBy,
  onSignedIn,
  onToken,
  busy = false,
}: AppleAuthButtonProps) {
  const t = useI11n(bag).apple
  const locale = useLocale()
  const router = useRouter()
  const loginWithApple = useUserStore((s) => s.loginWithApple)
  const loading = useUserStore((s) => s.isLoading)
  const [ready, setReady] = useState(false)
  const configured = isAppleAuthConfigured()
  // The next attempt's nonce, made ahead so the click can open Apple's popup
  // straight away (an await before it can lose the click and get it blocked).
  const nonceRef = useRef<AppleNonce | null>(null)
  const prepareNonce = useCallback(() => {
    nonceRef.current = null
    void createAppleNonce()
      .then((nonce) => {
        nonceRef.current = nonce
      })
      .catch((error: unknown) => {
        console.error('[apple-signin] nonce', error)
      })
  }, [])

  useEffect(() => {
    if (!configured) return
    let cancelled = false
    const redirectURI = getAppleRedirectUri(window.location.origin)
    if (new URL(redirectURI).hostname === 'localhost') {
      console.warn(
        `[apple-signin] Apple rejects localhost return URLs (${redirectURI}). Test on staging or through an HTTPS tunnel.`,
      )
    }
    loadAppleScript(appleScriptLocale(locale))
      .then(() => {
        if (cancelled || !window.AppleID) return
        window.AppleID.auth.init({
          clientId: getAppleClientId(),
          scope: 'name email',
          redirectURI,
          usePopup: true,
        })
        prepareNonce()
        setReady(true)
      })
      .catch((error: unknown) => {
        console.error('[apple-signin]', error)
      })
    return () => {
      cancelled = true
    }
  }, [configured, locale, prepareNonce])

  const onClick = useCallback(async () => {
    if (blocked) {
      onBlocked?.()
      showAppToast({
        title: t.blockedTitle,
        description: t.blockedDescription,
        type: 'warning',
      })
      return
    }
    const apple = window.AppleID
    if (!apple) return

    // One nonce per attempt: use the prepared one and start the next.
    const nonce = nonceRef.current ?? (await createAppleNonce())
    prepareNonce()

    // signIn() runs inside the click so the popup is not blocked.
    let response: AppleSignInResponse
    try {
      response = await apple.auth.signIn({
        clientId: getAppleClientId(),
        scope: 'name email',
        redirectURI: getAppleRedirectUri(window.location.origin),
        usePopup: true,
        nonce: nonce.hashed,
      })
    } catch (error) {
      const code = (error as { error?: string } | null)?.error
      if (
        code === 'popup_closed_by_user' ||
        code === 'user_cancelled_authorize'
      )
        return
      if (code === 'popup_blocked_by_browser') {
        showAppToast({ title: t.popupBlocked, type: 'error' })
        return
      }
      // A return URL mismatch shows Apple's error page in the popup.
      console.error(
        `[apple-signin] ${code ?? 'unknown error'}. The redirect URI ${getAppleRedirectUri(window.location.origin)} must exactly match a Return URL on Services ID ${getAppleClientId()}.`,
      )
      showAppToast({
        title: t.failedTitle,
        description: t.unavailable,
        type: 'error',
      })
      return
    }

    const credential = appleCredentialFromResponse(response, nonce.raw)
    if (!credential) {
      showAppToast({
        title: t.failedTitle,
        description: t.unavailable,
        type: 'error',
      })
      return
    }
    if (onToken) {
      await onToken(credential)
      return
    }
    try {
      await loginWithApple(credential)
      await onSignedIn?.()
      const me = useUserStore.getState().me
      router.push(
        resolvePostAuthRedirect({
          next,
          intent,
          emailVerified: me?.emailVerified,
          fallback: fallbackPath,
        }),
      )
    } catch (error) {
      showAppToast({
        title: t.failedTitle,
        description: getFriendlyErrorMessage(error, t.failedDescription),
        type: 'error',
      })
    }
  }, [
    blocked,
    fallbackPath,
    intent,
    loginWithApple,
    next,
    onBlocked,
    onSignedIn,
    onToken,
    prepareNonce,
    router,
    t,
  ])

  if (!configured) return null

  return (
    <AppleSignInButton
      label={t.continue}
      describedBy={describedBy}
      disabled={!ready || loading || busy}
      onClick={() => void onClick()}
    />
  )
}
