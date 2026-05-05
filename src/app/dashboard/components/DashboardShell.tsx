'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { LuBell, LuCircleHelp, LuSearch } from 'react-icons/lu'

import { Button, IconButton, Input } from '@ui'

export type DashboardNavKey =
  | 'overview'
  | 'quotes'
  | 'earnings'
  | 'history'
  | 'messages'
  | 'worker-register'

export type DashboardShellProps = {
  activeNav?: DashboardNavKey
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  userLabel: string
  userInitial: string
  userStatus?: string
  userMeta?: string
  workerEnabled?: boolean
  /** When set, sidebar promo reflects onboarding; nav locking still uses workerEnabled. */
  workerProfileComplete?: boolean
  workerCtaHref?: string
  headerAction?: React.ReactNode
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
  workerOnly?: boolean
}> = [
  {
    key: 'overview',
    label: 'Overview',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Overview</title>
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
    key: 'quotes',
    label: 'Quotes',
    href: '/dashboard/quotes',
    workerOnly: true,
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
    key: 'earnings',
    label: 'Earnings',
    href: '/dashboard/earnings',
    workerOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Earnings</title>
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
  {
    key: 'history',
    label: 'History',
    href: '/dashboard/history',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>History</title>
        <path
          d="M12 8v5l3 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M4.93 4.93A9.97 9.97 0 0 1 12 2a10 10 0 1 1-7.07 2.93M3 8V3h5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'messages',
    label: 'Messages',
    href: '/dashboard/messages',
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
]

const navSecondary: Array<{
  key: DashboardNavKey
  label: string
  href: string
  icon: React.ReactNode
}> = [
  {
    key: 'worker-register',
    label: 'Worker setup',
    href: '/dashboard/worker/register',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Worker setup</title>
        <path
          d="m12 4 7 4v8l-7 4-7-4V8l7-4Z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M9.5 12h5M12 9.5V14.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
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
  locked,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
  locked?: boolean
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
      borderRadius="xl"
      bg={active ? 'green.100' : 'transparent'}
      color={
        active ? 'secondary.900' : locked ? 'formLabelMuted' : 'formLabelMuted'
      }
      fontWeight={active ? 700 : 600}
      fontSize="sm"
      transition="background 0.15s ease, color 0.15s ease"
      _hover={{
        textDecoration: 'none',
        bg: active ? 'green.100' : 'cardBg',
        color: 'secondary.900',
      }}
    >
      <NavIcon>{icon}</NavIcon>
      <HStack gap={2} justify="space-between" flex="1">
        <Text>{label}</Text>
        {locked ? (
          <Text fontSize="10px" color="secondary.600" fontWeight={800}>
            LOCKED
          </Text>
        ) : null}
      </HStack>
    </Link>
  )
}

export function DashboardShell({
  activeNav = 'overview',
  searchPlaceholder = 'Search tasks, quotes, or records…',
  searchValue,
  onSearchChange,
  userLabel,
  userInitial,
  userStatus,
  userMeta,
  workerEnabled = false,
  workerProfileComplete,
  workerCtaHref = '/dashboard/worker/register',
  headerAction,
  children,
}: DashboardShellProps) {
  const workerOnboardingDone = workerProfileComplete ?? workerEnabled

  return (
    <Box minH="100vh" bg="bg" color="cardFg">
      <Stack
        direction={{ base: 'column', md: 'row' }}
        align="stretch"
        gap={0}
        minH="100vh"
      >
        <Box
          as="aside"
          w={{ base: 'full', md: '280px' }}
          flexShrink={0}
          bg="bg"
          px={{ base: 4, md: 5 }}
          py={{ base: 4, md: 8 }}
        >
          <Stack
            gap={6}
            maxH={{ md: '100vh' }}
            position={{ md: 'sticky' }}
            top={{ md: 0 }}
          >
            <HStack gap={3} align="flex-start">
              <Box
                w={10}
                h={10}
                borderRadius="xl"
                bg="primary"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="black"
                flexShrink={0}
                boxShadow="primary"
              >
                <NavIcon aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                    <title>Slashie</title>
                    <path
                      d="M14.75 4 7.5 12h5.75L9.25 20 16.5 10h-5.75L14.75 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </NavIcon>
              </Box>
              <Stack gap={0}>
                <Heading size="sm" lineHeight={1.25}>
                  slashie
                </Heading>
                <Text
                  fontSize="10px"
                  fontWeight={700}
                  letterSpacing="0.08em"
                  color="formLabelMuted"
                  textTransform="uppercase"
                >
                  Worker workspace
                </Text>
              </Stack>
            </HStack>

            <Box p={4} bg="cardBg" borderRadius="xl" boxShadow="card">
              <Stack gap={1}>
                <HStack gap={3}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg="primary"
                    color="black"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight={800}
                    fontSize="sm"
                    flexShrink={0}
                  >
                    {userInitial}
                  </Box>
                  <Stack gap={0}>
                    <Heading size="sm">{userLabel}</Heading>
                    {userStatus ? (
                      <Text
                        fontSize="xs"
                        color="secondary.600"
                        fontWeight={700}
                      >
                        {userStatus}
                      </Text>
                    ) : null}
                  </Stack>
                </HStack>
                {userMeta ? (
                  <Text fontSize="xs" color="formLabelMuted">
                    {userMeta}
                  </Text>
                ) : null}
              </Stack>
            </Box>

            <Stack gap={1} flex="1">
              {navPrimary.map((item) => (
                <SidebarNavLink
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={item.key === activeNav}
                  locked={Boolean(item.workerOnly && !workerEnabled)}
                />
              ))}
            </Stack>

            <Stack gap={1} pt={4}>
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

            <Box
              p={4}
              bg={
                workerOnboardingDone
                  ? 'linear-gradient(160deg, #0B1714 0%, #123D31 100%)'
                  : 'green.100'
              }
              color={workerOnboardingDone ? 'white' : 'cardFg'}
              borderRadius="xl"
            >
              <Stack gap={3}>
                <Text
                  fontSize="10px"
                  fontWeight={800}
                  letterSpacing="0.08em"
                  color={
                    workerOnboardingDone ? 'whiteAlpha.800' : 'secondary.600'
                  }
                >
                  {workerOnboardingDone
                    ? 'WORKER MODE ACTIVE'
                    : 'WORKER FEATURES LOCKED'}
                </Text>
                <Heading
                  size="sm"
                  color={workerOnboardingDone ? 'white' : undefined}
                >
                  {workerOnboardingDone
                    ? 'Your worker profile is set up.'
                    : 'Become a worker to send quotes.'}
                </Heading>
                <Text
                  fontSize="sm"
                  color={
                    workerOnboardingDone ? 'whiteAlpha.900' : 'formLabelMuted'
                  }
                >
                  {workerOnboardingDone
                    ? 'Track active quotes, monitor quote value, and keep your worker profile ready for new tasks.'
                    : 'Create your worker profile to unlock quoting, task intake, and earnings tracking in the dashboard.'}
                </Text>
                <Link
                  as={NextLink}
                  href={workerCtaHref}
                  color={workerOnboardingDone ? 'white' : 'secondary.600'}
                  fontWeight={700}
                  _hover={{
                    color: workerOnboardingDone
                      ? 'whiteAlpha.900'
                      : 'secondary.700',
                  }}
                >
                  {workerOnboardingDone
                    ? 'Manage worker profile'
                    : 'Become a worker'}
                </Link>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Stack flex="1" minW={0} gap={0}>
          <HStack
            as="header"
            px={{ base: 4, md: 8 }}
            py={4}
            bg="bg"
            gap={4}
            flexWrap="wrap"
            align="center"
          >
            <Box flex="1" minW="200px" maxW="480px">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value)
                }
                aria-label="Search tasks"
                startElement={<LuSearch size={18} aria-hidden />}
                rootProps={{
                  bg: 'cardBg',
                  borderRadius: 'full',
                  boxShadow: 'card',
                }}
              />
            </Box>
            {headerAction ? <Box>{headerAction}</Box> : null}
            <HStack gap={2} ml={{ base: 0, md: 'auto' }}>
              <IconButton
                aria-label="Notifications"
                borderRadius="full"
                bg="cardBg"
              >
                <LuBell size={18} aria-hidden />
              </IconButton>
              <IconButton aria-label="Help" borderRadius="full" bg="cardBg">
                <LuCircleHelp size={18} aria-hidden />
              </IconButton>
              <Box
                w={10}
                h={10}
                borderRadius="full"
                bg="primary"
                color="black"
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
