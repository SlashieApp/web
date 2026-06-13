'use client'

import { Box, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { Button } from '@ui'

import { AccountNavPanel } from './AccountNavPanel'
import { MembershipStatusCard } from './MembershipStatusCard'
import { MobileNavDrawer } from './MobileNavDrawer'
import { resolveAccountNavItems } from './accountNav.config'

export type AccountMenuProps = {
  /** Storybook: start with desktop panel open. */
  initialOpen?: boolean
}

function AccountAvatarTrigger({
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

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (ref.current?.contains(target)) return
      onOutside()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [enabled, onOutside, ref])
}

export function AccountMenu({ initialOpen = false }: AccountMenuProps) {
  const me = useMe()
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const notifications = useNotificationsOptional()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(initialOpen)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const hasWorker = Boolean(me?.worker)
  const navItems = resolveAccountNavItems(hasWorker)
  const postTaskBlocked = me != null && !isEmailVerified(me)

  const closeDesktop = useCallback(() => setDesktopOpen(false), [])

  useClickOutside(panelRef, closeDesktop, desktopOpen)

  useEffect(() => {
    if (!desktopOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDesktop()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeDesktop, desktopOpen])

  useEffect(() => {
    if (!desktopOpen) return
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a, button:not([disabled])',
    )
    firstFocusable?.focus()
  }, [desktopOpen])

  const onLogout = useCallback(() => {
    logout()
    if (typeof window !== 'undefined') window.location.assign('/')
  }, [logout])

  if (!user) return null

  const email = user.email ?? me?.email ?? ''
  const displayName = me?.profile?.name?.trim() || email || 'Account'
  const avatar = (
    <AccountAvatarTrigger
      name={me?.profile?.name}
      avatarUrl={me?.profile?.avatarUrl}
      email={email}
    />
  )

  return (
    <>
      <IconButton
        type="button"
        variant="ghost"
        aria-label="Account menu"
        display={{ base: 'inline-flex', md: 'none' }}
        onClick={() => setMobileOpen(true)}
      >
        {avatar}
      </IconButton>
      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      <Box position="relative" display={{ base: 'none', md: 'block' }}>
        <IconButton
          ref={triggerRef}
          type="button"
          variant="ghost"
          aria-label="Account menu"
          aria-expanded={desktopOpen}
          aria-haspopup="menu"
          aria-controls={panelId}
          onClick={() => setDesktopOpen((value) => !value)}
        >
          {avatar}
        </IconButton>

        {desktopOpen ? (
          <Box
            ref={panelRef}
            id={panelId}
            role="menu"
            aria-label="Account menu"
            position="absolute"
            top="calc(100% + 8px)"
            right={0}
            zIndex={50}
            w="320px"
            bg="cardBg"
            borderWidth="1px"
            borderColor="cardBorder"
            borderRadius="xl"
            boxShadow="lg"
            py={3}
            px={2}
          >
            <Stack gap={3} px={1}>
              <Box px={2}>
                <Text fontSize="sm" fontWeight={700} color="cardFg" truncate>
                  {displayName}
                </Text>
              </Box>

              <Box px={2}>
                <MembershipStatusCard
                  membership={me?.worker?.membership}
                  hasWorker={hasWorker}
                  variant="dropdown"
                />
              </Box>

              <AccountNavPanel
                items={navItems}
                onNavigate={closeDesktop}
                onLogout={onLogout}
                onOpenNotifications={() => notifications?.openDrawer()}
              />

              <Box px={2} pt={1}>
                {postTaskBlocked ? (
                  <Button size="sm" w="full" variant="secondary" disabled>
                    Post a task
                  </Button>
                ) : (
                  <Link
                    as={NextLink}
                    href="/tasks/create"
                    _hover={{ textDecoration: 'none' }}
                    onClick={closeDesktop}
                  >
                    <Button size="sm" w="full" variant="secondary">
                      Post a task
                    </Button>
                  </Link>
                )}
              </Box>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  )
}
