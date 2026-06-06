'use client'

import { Box } from '@chakra-ui/react'
import type { CredentialResponse } from '@react-oauth/google'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import {
  type AuthRedirectIntent,
  resolvePostAuthRedirect,
} from '@/app/(auth)/helpers/authRedirect'
import {
  getGoogleClientId,
  isGoogleAuthConfigured,
} from '@/app/(auth)/helpers/googleAuthConfig'
import { useUserStore } from '@/app/(auth)/store/user'
import { showAppToast } from '@/utils/appToast'

type GoogleAuthButtonProps = {
  intent?: AuthRedirectIntent | null
  next?: string | null
  redirect?: string | null
  fallbackPath?: string
}

export function GoogleAuthButton({
  intent = null,
  next = null,
  redirect = null,
  fallbackPath = '/dashboard',
}: GoogleAuthButtonProps) {
  const router = useRouter()
  const loginWithGoogle = useUserStore((s) => s.loginWithGoogle)
  const loading = useUserStore((s) => s.isLoading)
  const clientId = getGoogleClientId()
  const [buttonWidth, setButtonWidth] = useState(280)
  const [isClient, setIsClient] = useState(false)
  const clientReadyRef = useRef(false)

  const onContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const measured = Math.floor(node.getBoundingClientRect().width)
    if (measured > 0) setButtonWidth(measured)
    if (!clientReadyRef.current) {
      clientReadyRef.current = true
      setIsClient(true)
    }
  }, [])

  const onSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const idToken = credentialResponse.credential
      if (!idToken) return

      try {
        await loginWithGoogle(idToken)
        const me = useUserStore.getState().me
        router.push(
          resolvePostAuthRedirect({
            next,
            redirect,
            intent,
            emailVerified: me?.emailVerified,
            fallback: fallbackPath,
          }),
        )
      } catch {
        showAppToast({
          title: 'Could not sign in with Google',
          description: 'Something went wrong. Try again.',
          type: 'error',
        })
      }
    },
    [fallbackPath, intent, loginWithGoogle, next, redirect, router],
  )

  const onError = useCallback(() => {
    showAppToast({
      title: 'Google sign-in failed',
      description:
        'Allow popups for this site and try again. In Google testing mode, add your account as a test user in the developer console.',
      type: 'error',
    })
  }, [])

  if (!isGoogleAuthConfigured()) return null

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Box
        ref={onContainerRef}
        flex={1}
        minW={0}
        w="full"
        minH="48px"
        opacity={loading ? 0.72 : 1}
        pointerEvents={loading ? 'none' : 'auto'}
      >
        {isClient ? (
          <GoogleLogin
            onSuccess={(response) => void onSuccess(response)}
            onError={onError}
            useOneTap={false}
            text="continue_with"
            shape="pill"
            size="large"
            width={`${buttonWidth}`}
          />
        ) : null}
      </Box>
    </GoogleOAuthProvider>
  )
}
