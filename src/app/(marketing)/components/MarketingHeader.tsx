'use client'

import {
  Box,
  type BoxProps,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import {
  HeaderGuestAuthButtons,
  HeaderToolbarSeparator,
} from '@/ui/Header/GuestHeaderAuth'
import { HEADER_MIN_HEIGHT, HEADER_PADDING_X } from '@/ui/Header/headerShell'
import { GET_APP_HREF, MARKETING_HOME } from '@/utils/appRoutes'
import { Button, Drawer, Link, Logo } from '@ui'

const MARKETING_NAV_LINKS = [
  { key: 'pricing', label: 'Pricing', href: '/pricing' },
  { key: 'about', label: 'About', href: '/about' },
] as const

const navLinkProps = {
  fontSize: 'sm',
  fontWeight: 600,
  color: 'cardFg',
  whiteSpace: 'nowrap',
  _hover: { textDecoration: 'none', color: 'primary.700' },
} as const

const drawerLinkProps = {
  display: 'block',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'cardFg',
  _hover: { bg: 'badgeBg', textDecoration: 'none' },
} as const

function GetAppButton() {
  return (
    <Link
      href={GET_APP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      display="inline-flex"
      _hover={{ textDecoration: 'none' }}
      flexShrink={0}
    >
      <Button size="sm" variant="outline">
        Get app
      </Button>
    </Link>
  )
}

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function IconMenu() {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Menu</title>
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function MarketingNavigation() {
  const pathname = usePathname()
  const [hasMounted, setHasMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onMountNavigation = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasMounted) return
      setHasMounted(true)
    },
    [hasMounted],
  )

  const routePathname = hasMounted ? pathname : null

  return (
    <HStack
      ref={onMountNavigation}
      justify="space-between"
      align="center"
      gap={{ base: 3, md: 6 }}
      w="full"
    >
      <HStack flex={1} minW={0} align="center" gap={{ base: 3, md: 4 }}>
        <Link
          href={MARKETING_HOME}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          <Logo />
        </Link>

        <GetAppButton />

        <Text
          display={{ base: 'none', md: 'block' }}
          color="cardBorder"
          fontSize="sm"
          lineHeight={1}
          aria-hidden
        >
          |
        </Text>

        <HStack
          as="nav"
          gap={{ base: 4, md: 6 }}
          display={{ base: 'none', md: 'flex' }}
          align="center"
          minW={0}
        >
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              {...navLinkProps}
              color={
                isNavActive(routePathname, link.href) ? 'primary.700' : 'cardFg'
              }
            >
              {link.label}
            </Link>
          ))}
        </HStack>
      </HStack>

      <HStack gap={{ base: 2, md: 4 }} align="center" flexShrink={0}>
        <HeaderToolbarSeparator />
        <HeaderGuestAuthButtons loginHref="/login" signupHref="/register" />

        <IconButton
          aria-label="Open menu"
          variant="ghost"
          display={{ base: 'inline-flex', md: 'none' }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <IconMenu />
        </IconButton>
      </HStack>

      <Drawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Menu"
        placement="end"
        size="xs"
      >
        <Stack as="nav" align="stretch" gap={0} flex={1}>
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              {...drawerLinkProps}
              color={
                isNavActive(routePathname, link.href) ? 'primary.700' : 'cardFg'
              }
              fontWeight={isNavActive(routePathname, link.href) ? 700 : 600}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Stack
            gap={0}
            align="stretch"
            mt="auto"
            pt={3}
            borderTopWidth="1px"
            borderColor="cardBorder"
          >
            <Link
              href="/login"
              {...drawerLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/register"
              {...drawerLinkProps}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign up
            </Link>
          </Stack>
        </Stack>
      </Drawer>
    </HStack>
  )
}

export type MarketingHeaderProps = Omit<BoxProps, 'children'>

export function MarketingHeader(props: MarketingHeaderProps) {
  return (
    <Box
      as="header"
      zIndex={30}
      bg="bg"
      color="cardFg"
      backdropFilter="blur(20px)"
      borderWidth="1px"
      borderColor="cardBorder"
      px={HEADER_PADDING_X}
      minH={HEADER_MIN_HEIGHT}
      display="flex"
      alignItems="center"
      position="sticky"
      top={0}
      {...props}
    >
      <Box w="full" minH={HEADER_MIN_HEIGHT} display="flex" alignItems="center">
        <MarketingNavigation />
      </Box>
    </Box>
  )
}
