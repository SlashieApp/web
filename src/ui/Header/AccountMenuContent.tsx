'use client'

import { useCallback } from 'react'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { CurrentUserAvatar } from '@ui'

import { useDropdownClose } from '../Dropdown/Dropdown'
import { AccountMenuHeader } from './AccountMenuHeader'
import { AccountNavPanel } from './AccountNavPanel'
import { resolveAccountNavItems } from './accountNav.config'

export function AccountMenuAvatar({
  name,
  email,
}: {
  name?: string | null
  email: string
  /** @deprecated Prefer CurrentUserAvatar resolution; kept for call-site compat. */
  avatarUrl?: string | null
}) {
  const label = name?.trim() || email

  return <CurrentUserAvatar size="sm" name={label} />
}

type AccountMenuContentProps = {
  /** Override close handler (e.g. mobile drawer). Defaults to `useDropdownClose()`. */
  onClose?: () => void
}

/** Account menu panel body — slot into `Dropdown` or pass `onClose` for drawers. */
export function AccountMenuContent({ onClose }: AccountMenuContentProps = {}) {
  const me = useMe()
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const notifications = useNotificationsOptional()
  const closeFromDropdown = useDropdownClose()
  const close = onClose ?? closeFromDropdown

  const hasWorker = Boolean(me?.worker)
  const navItems = resolveAccountNavItems(hasWorker)

  const onLogout = useCallback(() => {
    logout()
    if (typeof window !== 'undefined') window.location.assign('/')
  }, [logout])

  if (!user) return null

  const email = user.email ?? me?.email ?? ''
  const displayName = me?.profile?.name?.trim() || email || 'Account'

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
