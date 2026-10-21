'use client'

import { useMutation } from '@apollo/client/react'
import { Stack, Text } from '@chakra-ui/react'
import {
  type ChangePasswordMutation,
  type ChangePasswordMutationVariables,
  LoginMethod,
  type SetPasswordMutation,
  type SetPasswordMutationVariables,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { PasswordInput } from '@/app/(auth)/components/ui/AuthFields'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import { useUserStore } from '@/app/(auth)/store/user'
import ChangePassword from '@/app/(dashboard)/account/graphql/ChangePassword.gql'
import SetPassword from '@/app/(dashboard)/account/graphql/SetPassword.gql'
import { verificationErrorText } from '@/app/(dashboard)/components/ui/verification/verificationError'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { duringTokenSwap, setAuthToken } from '@/utils/auth'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { FormField, Modal } from '@ui'

import {
  type AccountPasswordMode,
  type AccountPasswordValidationKey,
  type AccountPasswordValues,
  createAccountPasswordSchema,
} from '../../accountPasswordSchema'
import bag from '../../i11n.json'

/** Where the Google / Apple re-auth buttons send the user back to (dialog reopens). */
export const PASSWORD_REAUTH_RETURN = '/account?password=set#sign-in'

export type AccountPasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AccountPasswordMode
  email: string
  enabledLoginMethods: readonly LoginMethod[]
  /** The user just signed in again (back from `PASSWORD_REAUTH_RETURN`). */
  reauthed?: boolean
  /** The password was saved; the store's `me` already has it. */
  onSaved?: () => void
}

const EMPTY: AccountPasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

/**
 * Change the password (current password as re-auth) or, for a Google / Apple
 * only account, set a first one. Setting one needs a sign-in from the last
 * 10 minutes: on REAUTH_REQUIRED the dialog offers the same fresh Google /
 * Apple sign-in as Delete account, which returns here.
 */
export function AccountPasswordDialog({
  open,
  onOpenChange,
  mode,
  email,
  enabledLoginMethods,
  reauthed = false,
  onSaved,
}: AccountPasswordDialogProps) {
  const t = useI11n(bag).password
  const patchMe = useUserStore((s) => s.patchMe)
  const [error, setError] = useState<string | null>(null)
  const [needsReauth, setNeedsReauth] = useState(false)
  const [signedInAgain, setSignedInAgain] = useState(reauthed)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountPasswordValues>({
    resolver: zodResolver(createAccountPasswordSchema(mode)),
    defaultValues: EMPTY,
  })
  const [changePassword, change] = useMutation<
    ChangePasswordMutation,
    ChangePasswordMutationVariables
  >(ChangePassword)
  const [setPassword, set] = useMutation<
    SetPasswordMutation,
    SetPasswordMutationVariables
  >(SetPassword)
  const loading = change.loading || set.loading

  const fieldError = (key: string | undefined) =>
    key ? t.validation[key as AccountPasswordValidationKey] : undefined

  const close = (next: boolean) => {
    if (!next) {
      reset(EMPTY)
      setError(null)
      setNeedsReauth(false)
    }
    onOpenChange(next)
  }

  const onValid = async (values: AccountPasswordValues) => {
    setError(null)
    try {
      const methods =
        mode === 'change'
          ? // Every other session ends; this device keeps going on the
            // new token (BE-102).
            await duringTokenSwap(async () => {
              const changed = (
                await changePassword({
                  variables: {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                  },
                })
              ).data?.changePassword
              if (changed) setAuthToken(changed.token)
              return changed?.user.enabledLoginMethods
            })
          : (
              await setPassword({
                variables: { newPassword: values.newPassword },
              })
            ).data?.setPassword.enabledLoginMethods
      if (methods) patchMe({ enabledLoginMethods: methods })
      showAppToast({
        title: mode === 'change' ? t.changed : t.saved,
        type: 'success',
      })
      onSaved?.()
      close(false)
    } catch (err) {
      if (getGraphQLErrorCode(err) === 'REAUTH_REQUIRED') {
        setNeedsReauth(true)
        setSignedInAgain(false)
      }
      setError(verificationErrorText(t.errors, err, t.failed))
    }
  }

  // Signed in again in place (same page): clear the re-auth step.
  const onSignedInAgain = () => {
    setNeedsReauth(false)
    setSignedInAgain(true)
    setError(null)
  }

  return (
    <Modal
      open={open}
      onOpenChange={close}
      title={mode === 'change' ? t.changeTitle : t.setTitle}
      cancelLabel={t.cancel}
      submitLabel={t.save}
      onSubmit={() => void handleSubmit(onValid)()}
      submitLoading={loading}
      submitDisabled={needsReauth}
    >
      {mode === 'set' ? (
        <Text fontSize="sm">{formatMessage(t.setIntro, { email })}</Text>
      ) : null}
      {mode === 'change' ? (
        <FormField
          label={t.current}
          errorText={fieldError(errors.currentPassword?.message)}
        >
          <PasswordInput
            autoComplete="current-password"
            {...register('currentPassword')}
          />
        </FormField>
      ) : null}
      <FormField
        label={t.new}
        helperText={t.hint}
        errorText={fieldError(errors.newPassword?.message)}
      >
        <PasswordInput
          autoComplete="new-password"
          {...register('newPassword')}
        />
      </FormField>
      <FormField
        label={t.confirm}
        errorText={fieldError(errors.confirmPassword?.message)}
      >
        <PasswordInput
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
      </FormField>

      {error ? (
        <Text color="status.danger.fg" fontSize="sm" role="alert">
          {error}
        </Text>
      ) : null}

      {mode === 'set' && needsReauth ? (
        <Stack gap={3}>
          <Text fontSize="sm">{t.reauthBody}</Text>
          {enabledLoginMethods.includes(LoginMethod.Google) ? (
            <GoogleAuthButton
              next={PASSWORD_REAUTH_RETURN}
              onSignedIn={onSignedInAgain}
            />
          ) : null}
          {enabledLoginMethods.includes(LoginMethod.Apple) ? (
            <AppleAuthButton
              next={PASSWORD_REAUTH_RETURN}
              onSignedIn={onSignedInAgain}
            />
          ) : null}
        </Stack>
      ) : null}

      {mode === 'set' && signedInAgain && !needsReauth ? (
        <Text fontSize="sm" color="status.success.fg" fontWeight={600}>
          {t.reauthDone}
        </Text>
      ) : null}
    </Modal>
  )
}
