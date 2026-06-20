'use client'
import { Link } from '../Link'

import { Box } from '@chakra-ui/react'
import Image from 'next/image'
import { useCallback } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'

import { Button } from '../Button'
import { useDropdownClose } from '../Dropdown/Dropdown'
import { AccountMenuHeader } from './AccountMenuHeader'
import { AccountNavPanel } from './AccountNavPanel'
import { resolveAccountNavItems } from './accountNav.config'

export function AccountMenuAvatar({
  name,
  avatarUrl,
  email,
}: {
  name?: string | null
  avatarUrl?: string | null
  email: string
}) {
  const label = name?.trim() || email
  const initial = label.trim().charAt(0).toUpperCase() || '?'

  return (
    <Box
      boxSize="32px"
      borderRadius="full"
      bg="primary.100"
      color="primary.700"
      fontSize="sm"
      fontWeight={700}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      flexShrink={0}
      aria-hidden
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={32}
          height={32}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initial
      )}
    </Box>
  )
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
  const postTaskBlocked = me != null && !isEmailVerified(me)

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
        avatarUrl={me?.profile?.avatarUrl}
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

      <Box px={3} py={3}>
        {postTaskBlocked ? (
          <Button size="sm" w="full" variant="secondary" disabled>
            Post a task
          </Button>
        ) : (
          <Link
            href="/tasks/create"
            _hover={{ textDecoration: 'none' }}
            onClick={close}
          >
            <Button size="sm" w="full" variant="secondary">
              Post a task
            </Button>
          </Link>
        )}
      </Box>
    </>
  )
}
