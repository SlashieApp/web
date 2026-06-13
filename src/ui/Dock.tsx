'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { APP_HOME, GET_APP_HREF } from '@/utils/appRoutes'

import { IconButton } from './IconButton/IconButton'

type DockItem = {
  key: string
  caption?: string
  href: string
  active?: boolean
  icon: React.ReactNode
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

function WorkersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Workers</title>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 20c0-3 2.7-4.5 5.5-4.5S14.5 17 14.5 20M14.5 18.5c1.8-.3 4-1.5 5.5-3.5"
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

function GetAppPhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Get app</title>
      <rect
        x="6.5"
        y="3.5"
        width="11"
        height="17"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
      <rect
        x="17.35"
        y="10.25"
        width="1.35"
        height="3.5"
        rx="0.35"
        fill="currentColor"
      />
    </svg>
  )
}

export function Dock() {
  const [hasMounted, setHasMounted] = useState(false)
  const [currentPathname, setCurrentPathname] = useState<string | null>(null)

  /** Chat (`/dashboard/messages`) omitted until the feature is ready. */
  const items: DockItem[] = [
    {
      key: 'browse',
      caption: 'Discovery',
      href: APP_HOME,
      icon: <BrowseIcon />,
    },
    {
      key: 'workers',
      caption: 'Workers',
      href: '/workers',
      icon: <WorkersIcon />,
    },
    {
      key: 'jobs',
      caption: 'My Tasks',
      href: '/requests',
      icon: <JobsIcon />,
    },
    {
      key: 'profile',
      caption: 'Account',
      href: '/profile',
      icon: <ProfileIcon />,
    },
  ]

  const onMountDock = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasMounted) return
      setHasMounted(true)
      if (typeof window !== 'undefined') {
        setCurrentPathname(window.location.pathname)
      }
    },
    [hasMounted],
  )

  const isHrefActive = useCallback(
    (href: string): boolean => {
      if (!currentPathname) return false
      if (href === APP_HOME) {
        return (
          currentPathname === APP_HOME ||
          currentPathname.startsWith(`${APP_HOME}/`)
        )
      }
      return currentPathname === href || currentPathname.startsWith(`${href}/`)
    },
    [currentPathname],
  )

  return (
    <Box
      ref={onMountDock}
      display="flex"
      flexShrink={0}
      position="relative"
      alignSelf={{ base: 'stretch', md: 'stretch' }}
      w={{ base: 'full', md: '76px' }}
      bg="bg"
      borderTopWidth={{ base: '1px', md: 0 }}
      borderTopColor={{ base: 'cardBorder', md: 'transparent' }}
      borderRightWidth={{ base: 0, md: '1px' }}
      borderRightColor={{ base: 'transparent', md: 'cardBorder' }}
      justifyContent="flex-start"
      pt={{ base: 2, md: 6 }}
      px={2}
      pb={{ base: 'calc(env(safe-area-inset-bottom) + 8px)', md: 0 }}
    >
      <HStack
        as="nav"
        align="stretch"
        gap={{ base: 1, md: 2 }}
        flexDirection={{ base: 'row', md: 'column' }}
        justify={{ base: 'flex-start', md: 'flex-start' }}
        w="full"
        flex={{ base: undefined, md: 1 }}
        minH={{ base: undefined, md: 0 }}
      >
        {items.map((item) => (
          <Box
            key={item.key}
            display={{ base: 'flex', md: 'contents' }}
            flex={{ base: 1, md: 'unset' }}
            minW={0}
            justifyContent="center"
          >
            <IconButton
              href={item.href}
              icon={item.icon}
              caption={item.caption}
              active={isHrefActive(item.href)}
            />
          </Box>
        ))}
        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          alignItems="center"
          w="full"
          borderTopWidth="1px"
          borderTopColor="cardDivider"
          pt={3}
          mt="auto"
        >
          <IconButton
            href={GET_APP_HREF}
            icon={<GetAppPhoneIcon />}
            caption="Get app"
            active={false}
          />
        </Box>
      </HStack>
    </Box>
  )
}
