'use client'

import { useI11n } from '@/i18n/useI11n'
import { useCallback } from 'react'
import bag from '../i11n.json'

import { MeAvatar } from '@/app/(auth)/components/MeAvatar'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useDropdownClose } from '../../Dropdown'

import { AccountMenuHeader } from './AccountMenuHeader'
import { AccountNavPanel } from './AccountNavPanel'
import { resolveAccountNavItems } from './accountNav.config'

export function AccountMenuAvatar({
  name,
  email,
}: {
  name?: string | null
  email: string
  /** @deprecated MeAvatar resolves avatars; kept for call-site compat. */
  avatarUrl?: string | null
}) {
  const label = name?.trim() || email

  return <MeAvatar size="sm" name={label} />
}

type AccountMenuContentProps = {
  /** Override close handler (e.g. mobile drawer). Defaults to `useDropdownClose()`. */
  onClose?: () => void
}

/** Account menu panel body — slot into `Dropdown` or pass `onClose` for drawers. */
export function AccountMenuContent({ onClose }: AccountMenuContentProps = {}) {
  const me = useMe()
  const href = useLocalizedHref()
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const notifications = useNotificationsOptional()
  const closeFromDropdown = useDropdownClose()
  const close = onClose ?? closeFromDropdown
  const t = useI11n(bag)

  const hasWorker = Boolean(me?.worker)
  const navItems = resolveAccountNavItems(hasWorker)

  const onLogout = useCallback(() => {
    logout()
    if (typeof window !== 'undefined') window.location.assign(href('/'))
  }, [href, logout])

  if (!user) return null

  const email = user.email ?? me?.email ?? ''
  const displayName = me?.profile?.name?.trim() || email || t.accountFallback

  return (
    <>
      <AccountMenuHeader
        displayName={displayName}
        email={email}
        membership={me?.worker?.membership}
        hasWorker={hasWorker}
        onViewProfile={close}
      />

      <AccountNavPanel
        items={navItems}
        onNavigate={close}
        onLogout={onLogout}
        onOpenNotifications={() => notifications?.openDrawer()}
      />
    </>
  )
}
