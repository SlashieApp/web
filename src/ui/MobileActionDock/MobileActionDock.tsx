'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Text } from '../Typography'

type DockItem = {
  key: string
  label: string
  href: string
  active?: boolean
  icon: React.ReactNode
  hasDot?: boolean
}

function BrowseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Browse</title>
      <path
        d="M5 12a7 7 0 1 1 14 0 7 7 0 0 1-14 0Zm7-10v4M2 12h4m12 0h4M12 22v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function JobsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Jobs</title>
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 7V5h6v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Chat</title>
      <path
        d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Profile</title>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MobileActionDock() {
  const items: DockItem[] = [
    {
      key: 'browse',
      label: 'Browse',
      href: '/',
      active: true,
      icon: <BrowseIcon />,
    },
    { key: 'jobs', label: 'Jobs', href: '/dashboard', icon: <JobsIcon /> },
    {
      key: 'chat',
      label: 'Chat',
      href: '/dashboard/messages',
      icon: <ChatIcon />,
      hasDot: true,
    },
    {
      key: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: <ProfileIcon />,
    },
  ]

  return (
    <Box
      position="absolute"
      left={2}
      right={2}
      bottom={2}
      zIndex={6}
      bg="surfaceBright/95"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border"
      boxShadow="0 10px 32px rgba(15,23,42,0.24)"
      px={2}
      py={2}
      backdropFilter="blur(10px)"
    >
      <HStack justify="space-between" align="stretch" gap={1}>
        {items.map((item) => (
          <Box
            as={NextLink}
            key={item.key}
            href={item.href}
            flex={1}
            borderRadius="xl"
            bg={item.active ? 'primary.50' : 'transparent'}
            color={item.active ? 'primary.600' : 'muted'}
            textDecoration="none"
            py={1}
            _hover={{
              textDecoration: 'none',
              bg: item.active ? 'primary.100' : 'surfaceContainerLow',
            }}
          >
            <Stack align="center" gap={1} position="relative">
              <Box position="relative" display="inline-flex">
                {item.icon}
                {item.hasDot ? (
                  <Box
                    position="absolute"
                    top="-1px"
                    right="-3px"
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg="red.500"
                  />
                ) : null}
              </Box>
              <Text fontSize="xs" fontWeight={700}>
                {item.label}
              </Text>
            </Stack>
          </Box>
        ))}
      </HStack>
    </Box>
  )
}
