'use client'

import {
  Box,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerPositioner,
  DrawerRoot,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { useCallback } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { Button, IconButton, Link } from '@ui'

import { AccountMenuHeader } from './AccountMenuHeader'
import { AccountNavPanel } from './AccountNavPanel'
import { resolveAccountNavItems } from './accountNav.config'

export type MobileNavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  const me = useMe()
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const notifications = useNotificationsOptional()

  const hasWorker = Boolean(me?.worker)
  const navItems = resolveAccountNavItems(hasWorker)
  const postTaskBlocked = me != null && !isEmailVerified(me)

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const onLogout = useCallback(() => {
    logout()
    close()
    if (typeof window !== 'undefined') window.location.assign('/')
  }, [close, logout])

  if (!user) return null
  const email = user.email ?? me?.email ?? ''
  const displayName = me?.profile?.name?.trim() || email || 'Account'

  return (
    <DrawerRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => onOpenChange(details.open)}
      placement="end"
      size="full"
    >
      <DrawerBackdrop bg="blackAlpha.600" />
      <DrawerPositioner>
        <DrawerContent
          bg="bg.surface"
          display="flex"
          flexDirection="column"
          maxH="100dvh"
        >
          <HStack
            px={4}
            pt={4}
            pb={3}
            justify="space-between"
            align="center"
            flexShrink={0}
          >
            <DrawerCloseTrigger asChild>
              <IconButton aria-label="Close menu" variant="ghost">
                ×
              </IconButton>
            </DrawerCloseTrigger>

            {postTaskBlocked ? (
              <Button size="sm" variant="secondary" disabled>
                Post a task
              </Button>
            ) : (
              <Link
                href="/tasks/create"
                _hover={{ textDecoration: 'none' }}
                onClick={close}
              >
                <Button size="sm">Post a task</Button>
              </Link>
            )}
          </HStack>

          <DrawerBody
            px={4}
            pt={0}
            pb="calc(16px + env(safe-area-inset-bottom, 0px))"
            flex={1}
            minH={0}
            overflowY="auto"
          >
            <Stack gap={0} align="stretch">
              <Box
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="xl"
                overflow="hidden"
              >
                <AccountMenuHeader
                  displayName={displayName}
                  email={email}
                  avatarUrl={me?.profile?.avatarUrl}
                  membership={me?.worker?.membership}
                  hasWorker={hasWorker}
                  onViewProfile={close}
                />
              </Box>

              <AccountNavPanel
                items={navItems}
                onNavigate={close}
                onLogout={onLogout}
                onOpenNotifications={() => {
                  notifications?.openDrawer()
                  close()
                }}
              />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}
