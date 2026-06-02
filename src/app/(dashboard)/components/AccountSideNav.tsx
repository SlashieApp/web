'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { ACCOUNT_NAV, type AccountNavKey } from '../helpers/accountNav'

type AccountSideNavProps = {
  active: AccountNavKey
}

function NavIcon({ type }: { type: AccountNavKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
  } as const

  if (type === 'overview') {
    return (
      <svg {...common} aria-hidden>
        <title>Overview</title>
        <path
          d="M4 13.5L12 5l8 8.5M7 11.5V19h10v-7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'requests') {
    return (
      <svg {...common} aria-hidden>
        <title>My Requests</title>
        <path
          d="M7 4h10l3 3v13H4V4h3Zm10 0v3h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'quotes') {
    return (
      <svg {...common} aria-hidden>
        <title>My Quotes</title>
        <path
          d="M4 8h16v11H4V8Zm4-3h8v3H8V5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'earnings') {
    return (
      <svg {...common} aria-hidden>
        <title>Earnings</title>
        <path
          d="M12 3a9 9 0 1 0 9 9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 7v6l4 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'account') {
    return (
      <svg {...common} aria-hidden>
        <title>Account</title>
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 9.3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  return (
    <svg {...common} aria-hidden>
      <title>Profile</title>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19c.8-2.6 3.1-4.2 6.5-4.2s5.7 1.6 6.5 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Desktop side nav for the merged account hub. */
export function AccountSideNav({ active }: AccountSideNavProps) {
  return (
    <Stack as="nav" aria-label="Account sections" gap={1} w="full">
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            as={NextLink}
            href={item.href}
            display="flex"
            alignItems="center"
            gap={3}
            px={3}
            py={2.5}
            borderRadius="lg"
            bg={isActive ? 'primary.100' : 'transparent'}
            color={isActive ? 'primary.800' : 'cardFg'}
            fontWeight={isActive ? 700 : 600}
            fontSize="sm"
            _hover={{
              textDecoration: 'none',
              bg: isActive ? 'primary.100' : 'badgeBg',
            }}
          >
            <Box
              display="flex"
              color={isActive ? 'primary.700' : 'formLabelMuted'}
            >
              <NavIcon type={item.key} />
            </Box>
            <Text>{item.label}</Text>
          </Link>
        )
      })}
    </Stack>
  )
}

/** Mobile in-dashboard navigation with parity to desktop sections. */
export function AccountBottomNav({ active }: AccountSideNavProps) {
  return (
    <HStack
      as="nav"
      aria-label="Account sections"
      gap={0}
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={40}
      px={2}
      pt={2}
      pb="calc(env(safe-area-inset-bottom) + 10px)"
      borderTopWidth="1px"
      borderColor="cardBorder"
      bg="bg"
      display={{ base: 'flex', lg: 'none' }}
    >
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            as={NextLink}
            href={item.href}
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ textDecoration: 'none' }}
          >
            <Stack
              gap={0.5}
              align="center"
              px={1}
              py={1}
              borderRadius="md"
              color={isActive ? 'primary.700' : 'formLabelMuted'}
            >
              <NavIcon type={item.key} />
              <Text
                fontSize="xs"
                fontWeight={isActive ? 700 : 600}
                lineHeight={1}
              >
                {item.label}
              </Text>
            </Stack>
          </Link>
        )
      })}
    </HStack>
  )
}
