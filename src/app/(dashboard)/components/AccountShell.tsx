'use client'

import {
  Box,
  IconButton as ChakraIconButton,
  HStack,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { Button, Input, Logo } from '@ui'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { resolveAccountNavKey } from '../helpers/accountNav'
import { AccountBottomNav, AccountSideNav } from './AccountSideNav'

type AccountShellProps = {
  children: ReactNode
}

function SearchIcon() {
  return (
    <Box as="span" display="inline-flex" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <title>Search</title>
        <path
          d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm8.5 16.5-4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Messages</title>
      <path
        d="M4 6h16v10H7l-3 3V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Notifications</title>
      <path
        d="M6 16h12l-1.5-2.2v-3.5a4.5 4.5 0 0 0-9 0v3.5L6 16Zm4 2a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function completionFromMe(me: MeSnapshot) {
  const checks = [
    Boolean(me.profile?.name?.trim()),
    Boolean(me.profile?.contactNumber?.trim()),
    Boolean(me.worker?.id),
    Boolean(me.worker?.tagline?.trim()),
    Boolean(me.worker?.locationAddress?.trim()),
  ]
  const done = checks.filter(Boolean).length
  const total = checks.length
  const percent = Math.round((done / total) * 100)
  return {
    percent,
    done,
    total,
    isWorker: Boolean(me.worker?.id),
  }
}

/** Unified account hub shell with desktop rail + mobile bottom navigation. */
export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname()
  const active = resolveAccountNavKey(pathname)
  const me = useUserStore((state) => state.me)
  if (!me) return null
  const completion = completionFromMe(me)
  const profileName =
    me.profile?.name?.trim() || me.email.split('@')[0] || 'Member'
  const profileInitial = profileName.charAt(0).toUpperCase() || 'S'
  const profileLinkLabel = completion.isWorker
    ? 'Manage profile'
    : 'Continue setup'
  const profileLinkHref = completion.isWorker
    ? '/profile'
    : '/profile#profile-worker'

  return (
    <Box minH="100dvh" bg="neutral.100" color="cardFg">
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="280px"
        borderRightWidth="1px"
        borderColor="cardBorder"
        bg="bg"
        position="fixed"
        insetY={0}
        left={0}
      >
        <Stack h="full" py={6} px={5} gap={6}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            <Logo />
          </Link>

          <AccountSideNav active={active} />

          <Box mt="auto" display="grid" gap={4}>
            <Stack p={4} gap={3} bg="primary.100" borderRadius="xl">
              <Stack gap={0.5}>
                <Text fontSize="sm" fontWeight={700}>
                  Complete your profile
                </Text>
                <Text fontSize="xs" color="green.800">
                  Stand out and get more work.
                </Text>
              </Stack>

              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="xs" color="green.800">
                    {completion.done}/{completion.total} complete
                  </Text>
                  <Text fontSize="xs" color="green.800" fontWeight={700}>
                    {completion.percent}%
                  </Text>
                </HStack>
                <Box
                  h="6px"
                  borderRadius="full"
                  bg="whiteAlpha.700"
                  overflow="hidden"
                >
                  <Box h="full" bg="primary.600" w={`${completion.percent}%`} />
                </Box>
              </Stack>

              <Link
                as={NextLink}
                href={profileLinkHref}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" w="full">
                  {profileLinkLabel}
                </Button>
              </Link>
            </Stack>

            <Text fontSize="xs" color="formLabelMuted">
              Payments are arranged directly between customer and worker outside
              Slashie.
            </Text>
          </Box>
        </Stack>
      </Box>

      <Box
        minH="100dvh"
        pl={{ base: 0, lg: '280px' }}
        display="grid"
        gridTemplateRows="auto 1fr"
      >
        <Box
          as="header"
          borderBottomWidth="1px"
          borderColor="cardBorder"
          bg="bg"
          px={{ base: 4, md: 6 }}
          py={3}
          position="sticky"
          top={0}
          zIndex={20}
        >
          <HStack gap={3} justify="space-between" align="center">
            <Box display={{ base: 'none', md: 'block' }} flex="1" maxW="520px">
              <Input
                startElement={<SearchIcon />}
                aria-label="Search account hub"
                placeholder="Search tasks, requests, people..."
              />
            </Box>
            <Link
              as={NextLink}
              href="/"
              _hover={{ textDecoration: 'none' }}
              display={{ base: 'block', md: 'none' }}
            >
              <Logo />
            </Link>
            <HStack gap={2}>
              <ChakraIconButton
                aria-label="Messages"
                variant="ghost"
                size="sm"
                color="formLabelMuted"
                bg="badgeBg"
              >
                <MessageIcon />
              </ChakraIconButton>
              <ChakraIconButton
                aria-label="Notifications"
                variant="ghost"
                size="sm"
                color="formLabelMuted"
                bg="badgeBg"
              >
                <BellIcon />
              </ChakraIconButton>
              <Link
                as={NextLink}
                href="/profile"
                _hover={{ textDecoration: 'none' }}
                display="flex"
                alignItems="center"
                gap={2}
                borderRadius="full"
                px={1}
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="primary.100"
                  color="primary.700"
                  display="grid"
                  placeItems="center"
                  fontSize="sm"
                  fontWeight={700}
                  overflow="hidden"
                  flexShrink={0}
                >
                  {me.profile?.avatarUrl ? (
                    <Image
                      src={me.profile.avatarUrl}
                      alt={`${profileName} avatar`}
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  ) : (
                    profileInitial
                  )}
                </Box>
                <Text
                  display={{ base: 'none', md: 'block' }}
                  fontSize="sm"
                  fontWeight={600}
                  maxW="120px"
                  truncate
                >
                  {profileName}
                </Text>
              </Link>
            </HStack>
          </HStack>
        </Box>

        <Box
          px={{ base: 4, md: 6, xl: 8 }}
          py={{ base: 5, md: 6 }}
          pb={{ base: 24, lg: 8 }}
        >
          <Box w="full" maxW="1200px">
            {children}
          </Box>
        </Box>
      </Box>

      <AccountBottomNav active={active} />
    </Box>
  )
}
