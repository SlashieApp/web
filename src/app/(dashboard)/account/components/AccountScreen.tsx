'use client'

import { LoginMethod } from '@codegen/schema'
import { Suspense } from 'react'

import { useAccountSuspended } from '@/app/(auth)/helpers/accountDisabled'
import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import { useI11n } from '@/i18n/useI11n'
import { Link } from '@ui'

import bag from '../i11n.json'
import { ACCOUNT_VIEWS, getAccountView } from '../views'
import { AccountContactCard } from './ui/AccountContactCard'
import { AccountNotificationsCard } from './ui/AccountNotificationsCard'
import { AccountSignInCard } from './ui/AccountSignInCard'
import { DeleteAccountSection } from './ui/DeleteAccountSection'

/**
 * Account (views/README.md): Contact, Sign-in and security, Notifications
 * and language, then Delete account, in one column. The view decides what
 * can change; the dashboard gate owns loading and errors.
 */
export function AccountScreen() {
  const t = useI11n(bag)
  const me = useUserStore((s) => s.me)
  const suspended = useAccountSuspended(me)
  if (!me) return null

  const methods = me.enabledLoginMethods ?? []
  const config =
    ACCOUNT_VIEWS[
      getAccountView({
        suspended,
        hasPassword: methods.includes(LoginMethod.Password),
      })
    ]

  return (
    <DashboardPageLayout
      title={t.title}
      description={
        <>
          {t.descriptionBefore}
          <Link href="/profile" color="text.link">
            {t.profileLink}
          </Link>
          {t.descriptionAfter}
        </>
      }
    >
      <AccountContactCard readOnly={!config.editable} />
      <AccountSignInCard
        email={me.email}
        methods={methods}
        showPassword={config.showPassword}
      />
      <AccountNotificationsCard editable={config.editable} />
      {config.showDelete ? (
        <Suspense fallback={null}>
          <DeleteAccountSection enabledLoginMethods={methods} />
        </Suspense>
      ) : null}
    </DashboardPageLayout>
  )
}
