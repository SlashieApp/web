'use client'

import { useMutation } from '@apollo/client/react'
import { Text } from '@chakra-ui/react'
import {
  type LinkLoginMethodInput,
  type LinkLoginMethodMutation,
  type LinkLoginMethodMutationVariables,
  LoginMethod,
  type UnlinkLoginMethodMutation,
  type UnlinkLoginMethodMutationVariables,
} from '@codegen/schema'
import { useState } from 'react'

import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import { useUserStore } from '@/app/(auth)/store/user'
import LinkLoginMethod from '@/app/(dashboard)/account/graphql/LinkLoginMethod.gql'
import UnlinkLoginMethod from '@/app/(dashboard)/account/graphql/UnlinkLoginMethod.gql'
import { verificationErrorText } from '@/app/(dashboard)/components/ui/verification/verificationError'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { FormStack, Modal, ModalButton } from '@ui'

import bag from '../../i11n.json'

/** Google and Apple: the only methods Account links or unlinks. */
export type LinkableLoginMethod = LoginMethod.Google | LoginMethod.Apple

/** Brand names, the same in every language. */
export const PROVIDER_NAME: Record<LinkableLoginMethod, string> = {
  [LoginMethod.Google]: 'Google',
  [LoginMethod.Apple]: 'Apple',
}

type LoginMethodsUser = Pick<
  NonNullable<LinkLoginMethodMutation['linkLoginMethod']>,
  'enabledLoginMethods' | 'googleLoginEmail' | 'appleLoginEmail'
>

/** Mirrors the mutation's login-method fields into the store's `me`. */
function useApplyLoginMethods() {
  const patchMe = useUserStore((s) => s.patchMe)
  return (user: LoginMethodsUser | null | undefined) => {
    if (!user) return
    patchMe({
      enabledLoginMethods: user.enabledLoginMethods,
      googleLoginEmail: user.googleLoginEmail ?? null,
      appleLoginEmail: user.appleLoginEmail ?? null,
    })
  }
}

/** The bag's copy for an API code (with the provider filled in), else the fallback. */
function errorText(
  t: { errors: Record<string, string>; failed: string },
  error: unknown,
  provider: string,
) {
  return formatMessage(verificationErrorText(t.errors, error, t.failed), {
    provider,
  })
}

export type LinkLoginMethodDialogProps = {
  /** The provider to link, or null when closed. */
  method: LinkableLoginMethod | null
  onClose: () => void
  /** The account email, which stays as it is. */
  email: string
}

/**
 * Link Google or Apple: the provider's own button hands over a token
 * (`onToken`), then `linkLoginMethod`. Nothing signs in and the session and
 * account email stay the same; the provider address is stored on its own.
 */
export function LinkLoginMethodDialog({
  method,
  onClose,
  email,
}: LinkLoginMethodDialogProps) {
  const t = useI11n(bag).methods
  const apply = useApplyLoginMethods()
  const [error, setError] = useState<string | null>(null)
  const [linkLoginMethod, { loading }] = useMutation<
    LinkLoginMethodMutation,
    LinkLoginMethodMutationVariables
  >(LinkLoginMethod)
  const provider = method ? PROVIDER_NAME[method] : ''

  const close = () => {
    setError(null)
    onClose()
  }

  const link = async (input: LinkLoginMethodInput) => {
    setError(null)
    try {
      const result = await linkLoginMethod({ variables: { input } })
      apply(result.data?.linkLoginMethod)
      showAppToast({
        title: formatMessage(t.linkDone, { provider }),
        type: 'success',
      })
      close()
    } catch (err) {
      setError(errorText(t, err, provider))
    }
  }

  return (
    <Modal
      open={method !== null}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      title={formatMessage(t.linkTitle, { provider })}
      description={formatMessage(t.linkBody, { provider, email })}
      footer={
        <ModalButton type="button" variant="secondary" onClick={close}>
          {t.cancel}
        </ModalButton>
      }
    >
      {/* The provider's button is the main action here: 24 under the
          description, and the Cancel bar is 20 below it. Only the provider
          being linked shows, so there is nothing to put under a divider. */}
      <FormStack>
        {method === LoginMethod.Google ? (
          <GoogleAuthButton
            busy={loading}
            onToken={(oauthToken) =>
              link({ method: LoginMethod.Google, oauthToken })
            }
          />
        ) : null}
        {method === LoginMethod.Apple ? (
          <AppleAuthButton
            busy={loading}
            onToken={({ idToken, ...apple }) =>
              link({ method: LoginMethod.Apple, oauthToken: idToken, ...apple })
            }
          />
        ) : null}
        {error ? (
          <Text color="status.danger.fg" fontSize="sm" role="alert">
            {error}
          </Text>
        ) : null}
      </FormStack>
    </Modal>
  )
}

export type UnlinkLoginMethodDialogProps = {
  /** The provider to unlink, or null when closed. */
  method: LinkableLoginMethod | null
  onClose: () => void
}

/**
 * Unlink Google or Apple after a confirm. The API refuses to remove the last
 * way in (LAST_LOGIN_METHOD); that copy says to set a password first.
 */
export function UnlinkLoginMethodDialog({
  method,
  onClose,
}: UnlinkLoginMethodDialogProps) {
  const t = useI11n(bag).methods
  const apply = useApplyLoginMethods()
  const [error, setError] = useState<string | null>(null)
  const [unlinkLoginMethod, { loading }] = useMutation<
    UnlinkLoginMethodMutation,
    UnlinkLoginMethodMutationVariables
  >(UnlinkLoginMethod)
  const provider = method ? PROVIDER_NAME[method] : ''

  const close = () => {
    setError(null)
    onClose()
  }

  const unlink = async () => {
    if (!method) return
    setError(null)
    try {
      const result = await unlinkLoginMethod({ variables: { method } })
      apply(result.data?.unlinkLoginMethod)
      showAppToast({
        title: formatMessage(t.unlinkDone, { provider }),
        type: 'success',
      })
      close()
    } catch (err) {
      setError(errorText(t, err, provider))
    }
  }

  return (
    <Modal
      open={method !== null}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      title={formatMessage(t.unlinkTitle, { provider })}
      cancelLabel={t.cancel}
      submitLabel={t.unlink}
      onSubmit={() => void unlink()}
      submitLoading={loading}
    >
      {/* A confirm with no field: the sentence is the body, 24 under the
          title, and the buttons are 20 below it. */}
      <FormStack>
        <Text fontSize="sm">{formatMessage(t.unlinkBody, { provider })}</Text>
        {error ? (
          <Text color="status.danger.fg" fontSize="sm" role="alert">
            {error}
          </Text>
        ) : null}
      </FormStack>
    </Modal>
  )
}
