'use client'

import { Stack, Text } from '@chakra-ui/react'
import { LoginMethod } from '@codegen/schema'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { LuKeyRound } from 'react-icons/lu'

import { isAppleAuthConfigured } from '@/app/(auth)/helpers/appleAuthConfig'
import { isGoogleAuthConfigured } from '@/app/(auth)/helpers/googleAuthConfig'
import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import {
  SETTING_ROW_DIVIDERS,
  SettingRow,
} from '@/app/(dashboard)/components/ui/SettingRow'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import bag from '../../i11n.json'
import { AccountPasswordDialog } from './AccountPasswordDialog'
import {
  LinkLoginMethodDialog,
  type LinkableLoginMethod,
  UnlinkLoginMethodDialog,
} from './LoginMethodDialogs'

const ROW_BUTTON = { size: 'sm', minH: '44px', variant: 'secondary' } as const

export type AccountSignInCardProps = {
  /** The account email (not a provider address). */
  email: string
  methods: readonly LoginMethod[]
  /** The linked Google / Apple addresses; provider mappings, not `email`. */
  googleLoginEmail?: string | null
  appleLoginEmail?: string | null
  /** The Password row's form (README.md); null hides its button. */
  passwordForm: 'change' | 'set' | null
  /** Link, Unlink and the password button; off while suspended. */
  editable: boolean
}

/**
 * Sign-in and security: one row per way in (Password, Google, Apple), with
 * Link / Unlink for the providers and the password form, then Log out.
 * Coming back from a set-password re-auth (`?password=set`) reopens the form.
 */
export function AccountSignInCard({
  email,
  methods,
  googleLoginEmail = null,
  appleLoginEmail = null,
  passwordForm,
  editable,
}: AccountSignInCardProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const href = useLocalizedHref()
  const searchParams = useSearchParams()
  const logout = useUserStore((s) => s.logout)
  const returnedFromReauth =
    passwordForm === 'set' && searchParams.get('password') === 'set'
  const [passwordOpen, setPasswordOpen] = useState(returnedFromReauth)
  const [linking, setLinking] = useState<LinkableLoginMethod | null>(null)
  const [unlinking, setUnlinking] = useState<LinkableLoginMethod | null>(null)

  const providerRow = (
    method: LinkableLoginMethod,
    providerEmail: string | null,
    configured: boolean,
  ) => {
    const linked = methods.includes(method)
    const description = linked
      ? providerEmail
        ? formatMessage(t.methods.linkedAs, { email: providerEmail })
        : t.methods.linked
      : t.methods.notLinked
    return (
      <SettingRow
        key={method}
        label={t.loginMethodLabels[method]}
        description={
          <Text as="span" wordBreak="break-all">
            {description}
          </Text>
        }
      >
        {editable && linked ? (
          <Button {...ROW_BUTTON} onClick={() => setUnlinking(method)}>
            {t.methods.unlink}
          </Button>
        ) : null}
        {editable && !linked && configured ? (
          <Button {...ROW_BUTTON} onClick={() => setLinking(method)}>
            {t.methods.link}
          </Button>
        ) : null}
      </SettingRow>
    )
  }

  return (
    <DashboardSectionCard
      id="sign-in"
      title={t.signInTitle}
      description={t.signInDescription}
      icon={<LuKeyRound size={18} aria-hidden />}
    >
      <Stack gap={0} css={SETTING_ROW_DIVIDERS}>
        <SettingRow
          label={t.loginMethodLabels.PASSWORD}
          description={
            methods.includes(LoginMethod.Password)
              ? formatMessage(t.methods.passwordOn, { email })
              : t.methods.passwordOff
          }
        >
          {editable && passwordForm ? (
            <Button {...ROW_BUTTON} onClick={() => setPasswordOpen(true)}>
              {passwordForm === 'change' ? t.password.change : t.password.set}
            </Button>
          ) : null}
        </SettingRow>
        {providerRow(
          LoginMethod.Google,
          googleLoginEmail,
          isGoogleAuthConfigured(),
        )}
        {providerRow(
          LoginMethod.Apple,
          appleLoginEmail,
          isAppleAuthConfigured(),
        )}
        <SettingRow label={t.deviceLabel}>
          <Button
            {...ROW_BUTTON}
            onClick={() => {
              logout()
              router.push(href('/'))
            }}
          >
            {t.logout}
          </Button>
        </SettingRow>
      </Stack>
      {passwordForm ? (
        <AccountPasswordDialog
          key={passwordForm}
          open={passwordOpen}
          onOpenChange={setPasswordOpen}
          mode={passwordForm}
          email={email}
          enabledLoginMethods={methods}
          reauthed={returnedFromReauth}
          onSaved={() => {
            if (returnedFromReauth) {
              router.replace(href('/account#sign-in'), { scroll: false })
            }
          }}
        />
      ) : null}
      <LinkLoginMethodDialog
        method={linking}
        onClose={() => setLinking(null)}
        email={email}
      />
      <UnlinkLoginMethodDialog
        method={unlinking}
        onClose={() => setUnlinking(null)}
      />
    </DashboardSectionCard>
  )
}
