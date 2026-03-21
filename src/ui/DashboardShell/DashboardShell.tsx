'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { TextInput } from '../Input'
import { Heading, Text } from '../Typography'

export type DashboardNavKey =
  | 'dashboard'
  | 'my-jobs'
  | 'quotes'
  | 'messages'
  | 'payments'
  | 'settings'
  | 'support'

export type DashboardShellProps = {
  activeNav?: DashboardNavKey
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  userLabel: string
  userInitial: string
  children: React.ReactNode
}

function NavIcon({
  children,
  'aria-hidden': ariaHidden = true,
}: {
  children: React.ReactNode
  'aria-hidden'?: boolean
}) {
  return (
    <Box
      as="span"
      w="20px"
      h="20px"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      aria-hidden={ariaHidden}
    >
      {children}
    </Box>
  )
}

const navPrimary: Array<{
  key: DashboardNavKey
  label: string
  href: string
  icon: React.ReactNode
}> = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Dashboard</title>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'my-jobs',
    label: 'My Jobs',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>My Jobs</title>
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.36 6.36a2.83 2.83 0 1 1-4-4l6.36-6.36a6 6 0 0 1 7.94-7.94l-3.77 3.77Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'quotes',
    label: 'Quotes',
    href: '/dashboard?view=quotes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Quotes</title>
        <path
          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: 'messages',
    label: 'Messages',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Messages</title>
        <path
          d="M5 19.5 8.25 17H18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'payments',
    label: 'Payments',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Payments</title>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M7 15h4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

const navSecondary: Array<{
  key: DashboardNavKey
  label: string
  href: string
  icon: React.ReactNode
}> = [
  {
    key: 'settings',
    label: 'Settings',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Settings</title>
        <path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1-1.51V13a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 8 12.6a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 12 8.6V8a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15c.26.6.74 1.08 1.34 1.34V17a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.51-1Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'support',
    label: 'Support',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Support</title>
        <path
          d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M12 17h.01"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      </svg>
    ),
  },
]

function SidebarNavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      as={NextLink}
      href={href}
      display="flex"
      alignItems="center"
      gap={3}
      px={3}
      py={2.5}
      borderRadius="md"
      borderLeftWidth="3px"
      borderLeftColor={active ? 'primary.500' : 'transparent'}
      bg={active ? 'primary.50' : 'transparent'}
      color={active ? 'primary.700' : 'muted'}
      fontWeight={active ? 700 : 600}
      fontSize="sm"
      transition="background 0.15s ease, color 0.15s ease"
      _hover={{
        textDecoration: 'none',
        bg: active ? 'primary.50' : 'surfaceContainerLow',
        color: 'primary.700',
      }}
    >
      <NavIcon>{icon}</NavIcon>
      {label}
    </Link>
  )
}

export function DashboardShell({
  activeNav = 'my-jobs',
  searchPlaceholder = 'Search your jobs…',
  searchValue,
  onSearchChange,
  userLabel,
  userInitial,
  children,
}: DashboardShellProps) {
  return (
    <Box minH="100vh" bg="bg" color="fg">
      <Stack
        direction={{ base: 'column', md: 'row' }}
        align="stretch"
        gap={0}
        minH="100vh"
      >
        <Box
          as="aside"
          w={{ base: 'full', md: '260px' }}
          flexShrink={0}
          borderRightWidth={{ base: 0, md: '1px' }}
          borderBottomWidth={{ base: '1px', md: 0 }}
          borderColor="border"
          bg="surfaceContainerLowest"
          px={{ base: 4, md: 5 }}
          py={{ base: 4, md: 8 }}
        >
          <Stack
            gap={8}
            maxH={{ md: '100vh' }}
            position={{ md: 'sticky' }}
            top={{ md: 0 }}
          >
            <HStack gap={3} align="flex-start">
              <Box
                w={10}
                h={10}
                borderRadius="md"
                bg="linear-gradient(135deg, #003fb1 0%, #1a56db 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                flexShrink={0}
              >
                <NavIcon aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                    <title>HandyBox</title>
                    <path
                      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.36 6.36a2.83 2.83 0 1 1-4-4l6.36-6.36a6 6 0 0 1 7.94-7.94l-3.77 3.77Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </NavIcon>
              </Box>
              <Stack gap={0}>
                <Heading size="sm" lineHeight={1.25}>
                  HandyBox
                </Heading>
                <Text
                  fontSize="10px"
                  fontWeight={700}
                  letterSpacing="0.08em"
                  color="muted"
                  textTransform="uppercase"
                >
                  Master Craftsman Portal
                </Text>
              </Stack>
            </HStack>

            <Stack gap={1} flex="1">
              {navPrimary.map((item) => (
                <SidebarNavLink
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={item.key === activeNav}
                />
              ))}
            </Stack>

            <Stack gap={1} pt={4} borderTopWidth="1px" borderColor="border">
              {navSecondary.map((item) => (
                <SidebarNavLink
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={item.key === activeNav}
                />
              ))}
            </Stack>
          </Stack>
        </Box>

        <Stack flex="1" minW={0} gap={0}>
          <HStack
            as="header"
            px={{ base: 4, md: 8 }}
            py={4}
            borderBottomWidth="1px"
            borderColor="border"
            bg="surfaceContainerLowest"
            gap={4}
            flexWrap="wrap"
            align="center"
          >
            <Box flex="1" minW="200px" maxW="480px" position="relative">
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                color="muted"
                pointerEvents="none"
                zIndex={1}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <title>Search</title>
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path
                    d="m16.5 16.5 4 4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </Box>
              <TextInput
                pl={10}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                bg="surfaceContainerLow"
                borderRadius="full"
                aria-label="Search jobs"
              />
            </Box>
            <HStack gap={2} ml={{ base: 0, md: 'auto' }}>
              <Box
                as="button"
                w={10}
                h={10}
                borderRadius="full"
                bg="surfaceContainerLow"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="lg"
                aria-label="Notifications"
              >
                🔔
              </Box>
              <Box
                as="button"
                w={10}
                h={10}
                borderRadius="full"
                bg="surfaceContainerLow"
                display="flex"
                alignItems="center"
                justifyContent="center"
                aria-label="Help"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <title>Help</title>
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 17h.01"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </Box>
              <Box
                w={10}
                h={10}
                borderRadius="full"
                bg="primary.500"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight={800}
                fontSize="sm"
                title={userLabel}
                aria-label={`Account: ${userLabel}`}
              >
                {userInitial}
              </Box>
            </HStack>
          </HStack>

          <Box
            flex="1"
            px={{ base: 4, md: 8 }}
            py={{ base: 6, md: 8 }}
            overflow="auto"
          >
            {children}
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
