'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'

import { focusVisibleMatchesHover } from '@/theme/system'
import { ACCOUNT_NAV, type AccountNavKey } from '@/utils/accountNav'
import { Drawer, IconButton, Link } from '@ui'

function dashboardNavRowInteraction(active: boolean) {
  const hover = {
    textDecoration: 'none',
    bg: active ? 'status.success.soft' : 'bg.subtle',
  }
  return {
    _hover: hover,
    ...focusVisibleMatchesHover(hover),
  }
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

  if (type === 'workers') {
    return (
      <svg {...common} aria-hidden>
        <title>Workers</title>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle
          cx="17"
          cy="9"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M3.5 20c0-3 2.7-4.5 5.5-4.5S14.5 17 14.5 20M14.5 18.5c1.8-.3 4-1.5 5.5-3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
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

  if (type === 'billing') {
    return (
      <svg {...common} aria-hidden>
        <title>Billing</title>
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
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

export type DashboardSectionNavProps = {
  active: AccountNavKey
  onNavigate?: () => void
  variant?: 'sidebar' | 'drawer'
}

export function DashboardSectionNav({
  active,
  onNavigate,
  variant = 'sidebar',
}: DashboardSectionNavProps) {
  return (
    <Stack as="nav" aria-label="Dashboard sections" gap={1} w="full">
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            href={item.href}
            display="flex"
            alignItems="center"
            gap={3}
            px={3}
            py={variant === 'drawer' ? 3 : 2.5}
            minH={variant === 'drawer' ? '44px' : undefined}
            borderRadius="lg"
            bg={isActive ? 'status.success.soft' : 'transparent'}
            color={isActive ? 'status.success.fg' : 'text.default'}
            fontWeight={isActive ? 700 : 600}
            fontSize="sm"
            {...dashboardNavRowInteraction(isActive)}
            onClick={onNavigate}
          >
            <Box
              display="flex"
              color={isActive ? 'status.success.fg' : 'text.muted'}
              flexShrink={0}
            >
              <NavIcon type={item.key} />
            </Box>
            <Stack gap={0} minW={0}>
              <Text>{item.label}</Text>
              {variant === 'drawer' ? (
                <Text fontSize="xs" color="text.muted" lineClamp={2}>
                  {item.description}
                </Text>
              ) : null}
            </Stack>
          </Link>
        )
      })}
    </Stack>
  )
}

function MenuIcon() {
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

export function DashboardContextLabel({ active }: { active: AccountNavKey }) {
  const activeItem = ACCOUNT_NAV.find((item) => item.key === active)

  return (
    <Stack gap={0} minW={0} flex={1}>
      <Text fontSize="xs" color="text.muted" fontWeight={600} lineHeight={1.2}>
        Dashboard
      </Text>
      <Text
        fontSize="sm"
        fontWeight={700}
        color="text.default"
        truncate
        lineHeight={1.3}
      >
        {activeItem?.label ?? 'Overview'}
      </Text>
    </Stack>
  )
}

export function DashboardSectionMenuButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <IconButton
      aria-label="Open dashboard sections"
      variant="ghost"
      display={{ base: 'inline-flex', lg: 'none' }}
      flexShrink={0}
      onClick={onClick}
    >
      <MenuIcon />
    </IconButton>
  )
}

export type DashboardSectionDrawerProps = {
  active: AccountNavKey
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Dashboard section drawer — trigger is rendered separately in the app header. */
export function DashboardSectionDrawer({
  active,
  open,
  onOpenChange,
}: DashboardSectionDrawerProps) {
  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Dashboard sections"
      description="Jump between your requests, quotes, billing, and account tools."
      placement="start"
      size="sm"
    >
      <DashboardSectionNav
        active={active}
        variant="drawer"
        onNavigate={close}
      />
    </Drawer>
  )
}
