'use client'

import { Box, type BoxProps, HStack, IconButton, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

import { clearAuthToken, getAuthToken } from '@/utils/auth'
import { Button } from '../Button'
import { Container } from '../Container'
import { Heading } from '../Typography'

const navLinkProps = {
  fontSize: 'sm',
  fontWeight: 600,
  color: 'muted',
  _hover: { textDecoration: 'none', color: 'primary.700' },
} as const

function IconBell() {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Notifications</title>
        <path
          d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconUser() {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Profile</title>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 20c0-4 4-6 8-6s8 2 8 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

export type HeaderActiveItem =
  | 'home'
  | 'tasks'
  | 'my-tasks'
  | 'post-task'
  | 'profile'
  | 'none'

export type HeaderProps = {
  /** When omitted and `children` is omitted, renders the default site navigation. */
  activeItem?: HeaderActiveItem
  children?: React.ReactNode
} & Omit<BoxProps, 'children'>

function SiteNavigation() {
  const router = useRouter()
  const isLoggedIn = Boolean(getAuthToken())
  const taskerHref = isLoggedIn
    ? '/dashboard'
    : `/login?next=${encodeURIComponent('/dashboard')}`

  return (
    <HStack
      justify="space-between"
      align="center"
      gap={4}
      py={2}
      flexWrap="wrap"
      w="full"
    >
      <HStack
        gap={{ base: 2, md: 4 }}
        flexWrap="wrap"
        align="center"
        flex="1"
        minW={0}
      >
        <Heading size="md" flexShrink={0}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            HandyBox
          </Link>
        </Heading>

        <HStack gap={{ base: 2, md: 3 }} flexWrap="wrap">
          <Link as={NextLink} href="/" {...navLinkProps}>
            Browse tasks
          </Link>

          {isLoggedIn ? (
            <>
              <Link as={NextLink} href="/quotes" {...navLinkProps}>
                Quotes
              </Link>
              <Link as={NextLink} href="/requests" {...navLinkProps}>
                Requests
              </Link>
            </>
          ) : null}
        </HStack>
      </HStack>

      <HStack
        gap={{ base: 2, md: 3 }}
        flexWrap="wrap"
        align="center"
        justify="flex-end"
        flexShrink={0}
      >
        <Button as={NextLink} href="/tasks/create" size="sm" variant="outline">
          Post a task
        </Button>
        <Button as={NextLink} href={taskerHref} size="sm">
          Become a tasker
        </Button>
        {isLoggedIn ? (
          <>
            <Box
              display={{ base: 'none', sm: 'block' }}
              alignSelf="stretch"
              w="1px"
              minH={6}
              bg="border"
              my="auto"
              aria-hidden
            />
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              colorPalette="blue"
              color="primary.600"
              _hover={{ bg: 'rgba(0, 63, 177, 0.06)' }}
            >
              <NextLink href="/dashboard" aria-label="Notifications">
                <IconBell />
              </NextLink>
            </IconButton>
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              colorPalette="blue"
              color="primary.600"
              _hover={{ bg: 'rgba(0, 63, 177, 0.06)' }}
            >
              <NextLink href="/profile" aria-label="Profile">
                <IconUser />
              </NextLink>
            </IconButton>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                clearAuthToken()
                router.push('/')
              }}
            >
              Log out
            </Button>
          </>
        ) : null}
      </HStack>
    </HStack>
  )
}

export function Header({
  activeItem: _activeItem = 'none',
  children,
  ...props
}: HeaderProps) {
  return (
    <Box
      as="header"
      top={2}
      left={2}
      right={24}
      zIndex={30}
      bg="surfaceBright"
      borderRadius="xl"
      backdropFilter="blur(20px)"
      boxShadow="ambient"
      px={{ base: 2, md: 0 }}
      py={1}
      {...props}
    >
      <Container>{children ?? <SiteNavigation />}</Container>
    </Box>
  )
}
