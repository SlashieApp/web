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
  IconButton,
  Link,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { Avatar, Button } from '@ui'

import { AccountNavPanel } from './AccountNavPanel'
import { MembershipStatusCard } from './MembershipStatusCard'
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
  if (!user) return null
  const displayName =
    me?.profile?.name?.trim() || user?.email || me?.email || 'Account'

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const onLogout = useCallback(() => {
    logout()
    close()
    if (typeof window !== 'undefined') window.location.assign('/')
  }, [close, logout])

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
          bg="bg"
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
                as={NextLink}
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
            <Stack gap={4} align="stretch">
              <Box
                borderWidth="1px"
                borderColor="cardBorder"
                borderRadius="xl"
                p={4}
              >
                <Stack gap={2}>
                  <Avatar
                    name={displayName}
                    src={me?.profile?.avatarUrl ?? undefined}
                    label={displayName}
                    labelProps={{
                      fontSize: 'md',
                      fontWeight: 700,
                      color: 'cardFg',
                    }}
                  />
                  <Link
                    as={NextLink}
                    href="/profile"
                    fontSize="sm"
                    fontWeight={600}
                    color="primary.700"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={close}
                  >
                    View profile
                  </Link>
                </Stack>
              </Box>

              <MembershipStatusCard
                membership={me?.worker?.membership}
                hasWorker={hasWorker}
                variant="drawer"
              />

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
