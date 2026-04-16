'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

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

export function Dock() {
  const [hasMounted, setHasMounted] = useState(false)
  const [currentPathname, setCurrentPathname] = useState<string | null>(null)

  const items: DockItem[] = [
    {
      key: 'browse',
      caption: 'Discovery',
      href: '/',
      icon: <BrowseIcon />,
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
    {
      key: 'chat',
      caption: 'Chat',
      href: '/dashboard/messages',
      icon: <ChatIcon />,
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
      if (href === '/') return currentPathname === '/'
      return currentPathname.startsWith(href)
    },
    [currentPathname],
  )

  return (
    <Box
      ref={onMountDock}
      display="flex"
      position={{ base: 'fixed', md: 'relative' }}
      alignSelf={{ base: 'auto', md: 'stretch' }}
      h={{ base: 'auto', md: 'full' }}
      minH={{ base: 'auto', md: 'full' }}
      left={{ base: 2, md: 0 }}
      right={{ base: 2, md: 'auto' }}
      bottom={{ base: 2, md: 0 }}
      zIndex={20}
      bg="bg"
      borderWidth={{ base: '1px', md: 0 }}
      borderColor={{ base: 'jobCardBorder', md: 'transparent' }}
      borderRightWidth={{ base: 0, md: '1px' }}
      borderRightColor={{ base: 'transparent', md: 'jobCardBorder' }}
      w={{ base: 'auto', md: '76px' }}
      justifyContent="flex-start"
      pt={{ base: 2, md: 6 }}
      px={2}
      borderRadius={{ base: '2xl', md: 0 }}
      boxShadow={{
        base: '0 10px 32px rgba(15,23,42,0.24)',
        md: 'none',
      }}
      backdropFilter={{ base: 'blur(10px)', md: 'none' }}
    >
      <HStack
        as="nav"
        align="stretch"
        gap={{ base: 1, md: 2 }}
        flexDirection={{ base: 'row', md: 'column' }}
        justify={{ base: 'space-between', md: 'flex-start' }}
        w="full"
      >
        {items.map((item) => (
          <IconButton
            key={item.key}
            href={item.href}
            icon={item.icon}
            caption={item.caption}
            active={isHrefActive(item.href)}
          />
        ))}
      </HStack>
    </Box>
  )
}
