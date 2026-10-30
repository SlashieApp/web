'use client'

import { Box } from '@chakra-ui/react'
import type { CredentialResponse } from '@react-oauth/google'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  type AuthRedirectIntent,
  resolvePostAuthRedirect,
} from '@/app/(auth)/helpers/authRedirect'
import { guardBlockedGoogleButton } from '@/app/(auth)/helpers/blockedGoogleButton'
import {
  getGoogleClientId,
  isGoogleAuthConfigured,
} from '@/app/(auth)/helpers/googleAuthConfig'
import { googleButtonDrawing } from '@/app/(auth)/helpers/socialButton'
import { useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

import bag from '../i11n.json'

type GoogleAuthButtonProps = {
  intent?: AuthRedirectIntent | null
  next?: string | null
  fallbackPath?: string
  /**
   * When true, intercepts the Google widget so a new account cannot be
   * created without the register-page consent checkboxes.
   */
  blocked?: boolean
  blockedTitle?: string
  blockedDescription?: string
  /**
   * The id of the text that says why the button is blocked (sign up's hint).
   * While `blocked`, it is set as `aria-describedby` on Google's own
   * `role="button"` node (drawn a moment after the script loads, so it is
   * applied as the node appears), not on a wrapper.
   */
  describedBy?: string
  onBlocked?: () => void
  /** Runs after sign-in succeeds, before the redirect (e.g. sign-up opt-ins). */
  onSignedIn?: () => Promise<void> | void
  /**
   * Link mode: hands over Google's ID token instead of signing in, so the
   * session and redirect stay as they are (Account → link Google).
   */
  onToken?: (idToken: string) => Promise<void> | void
  /** Hold the widget while the caller is busy (link mode). */
  busy?: boolean
}

export function GoogleAuthButton({
  intent = null,
  next = null,
  fallbackPath = APP_HOME,
  blocked = false,
  blockedTitle,
  blockedDescription,
  describedBy,
  onBlocked,
  onSignedIn,
  onToken,
  busy = false,
}: GoogleAuthButtonProps) {
  const t = useI11n(bag).google
  const router = useRouter()
  const loginWithGoogle = useUserStore((s) => s.loginWithGoogle)
  const loading = useUserStore((s) => s.isLoading) || busy
  const clientId = getGoogleClientId()
  const [buttonWidth, setButtonWidth] = useState(280)
  const [isClient, setIsClient] = useState(false)
  const clientReadyRef = useRef(false)
  const resizeRef = useRef<ResizeObserver | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Google draws the button at a fixed pixel width (200 to 400), so follow
  // the container: the auth card gains padding at the desktop breakpoint.
  // The layout width (`offsetWidth`), not the bounding box: a dialog scales in
  // when it opens, and a scaled box measures narrower, which left Google's
  // button short of Apple's in an account dialog on a phone.
  const onContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    resizeRef.current?.disconnect()
    resizeRef.current = null
    if (!node) return
    const measure = () => {
      const measured = node.offsetWidth
      if (measured > 0) setButtonWidth(Math.min(measured, 400))
    }
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      resizeRef.current = new ResizeObserver(measure)
      resizeRef.current.observe(node)
    }
    if (!clientReadyRef.current) {
      clientReadyRef.current = true
      setIsClient(true)
    }
  }, [])

  const showBlocked = useCallback(() => {
    onBlocked?.()
    showAppToast({
      title: blockedTitle ?? t.blockedTitle,
      description: blockedDescription ?? t.blockedDescription,
      type: 'warning',
    })
  }, [blockedDescription, blockedTitle, onBlocked, t])

  // While blocked: describe Google's own button and catch Enter and Space
  // before Google's handler (see blockedGoogleButton). The latest `showBlocked`
  // is read through a ref so a new callback does not rebuild the guard.
  const showBlockedRef = useRef(showBlocked)
  useEffect(() => {
    showBlockedRef.current = showBlocked
  }, [showBlocked])
  useEffect(() => {
    const node = containerRef.current
    if (!blocked || !isClient || !node) return
    return guardBlockedGoogleButton(node, {
      describedBy,
      onBlocked: () => showBlockedRef.current(),
    })
  }, [blocked, describedBy, isClient])

  const onSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (blocked) {
        showBlocked()
        return
      }
      const idToken = credentialResponse.credential
      if (!idToken) return
      if (onToken) {
        await onToken(idToken)
        return
      }

      try {
        await loginWithGoogle(idToken)
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
    },
    [
      blocked,
      fallbackPath,
      intent,
      loginWithGoogle,
      next,
      onSignedIn,
      onToken,
      router,
      showBlocked,
      t,
    ],
  )

  const onError = useCallback(() => {
    showAppToast({
      title: t.popupFailedTitle,
      description: t.popupFailedDescription,
      type: 'error',
    })
  }, [t])

  if (!isGoogleAuthConfigured()) return null

  // Drawn narrower by the scale, so the scaled button fills the container; on a
  // container too narrow for Google's 200 the scale gives way, so it fits.
  const { drawnWidth, scale } = googleButtonDrawing(buttonWidth)

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Box
        ref={onContainerRef}
        flex={1}
        minW={0}
        w="full"
        minH="form.controlHeight"
        opacity={loading ? 0.72 : 1}
        pointerEvents={loading ? 'none' : 'auto'}
      >
        {isClient ? (
          <Box
            position="relative"
            w={`${drawnWidth}px`}
            transform={`scale(${scale})`}
            transformOrigin="top left"
          >
            <GoogleLogin
              onSuccess={(response) => void onSuccess(response)}
              onError={onError}
              useOneTap={false}
              text="continue_with"
              shape="pill"
              size="large"
              width={`${drawnWidth}`}
            />
            {blocked ? (
              <Box
                position="absolute"
                inset={0}
                cursor="pointer"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  showBlocked()
                }}
              />
            ) : null}
          </Box>
        ) : null}
      </Box>
    </GoogleOAuthProvider>
  )
}
