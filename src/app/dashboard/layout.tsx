'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import {
  DashboardDataProvider,
  useDashboardData,
} from '@/app/dashboard/context'

import { Button, SectionCard } from '@ui'

import {
  type DashboardNavKey,
  DashboardShell,
} from './components/DashboardShell'

function resolveActiveNav(pathname: string): DashboardNavKey {
  if (pathname.startsWith('/dashboard/quotes')) return 'quotes'
  if (pathname.startsWith('/dashboard/earnings')) return 'earnings'
  if (pathname.startsWith('/dashboard/history')) return 'history'
  if (pathname.startsWith('/dashboard/messages')) return 'messages'
  if (pathname.startsWith('/dashboard/worker/register'))
    return 'worker-register'
  return 'overview'
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const {
    me,
    meLoading,
    meErrorMessage,
    refetchDashboardData,
    search,
    setSearch,
    displayName,
    userInitial,
    workerEnabled,
    workerProfileComplete,
  } = useDashboardData()

  if (!meLoading && !me) {
    return (
      <Box bg="bg" color="cardFg" minH="100vh" py={{ base: 8, md: 12 }} px={4}>
        <Stack gap={8} maxW="lg" mx="auto">
          <Box>
            <Heading size="lg">Worker dashboard</Heading>
            <Text color="formLabelMuted" mt={2}>
              Sign in to manage quotes, earnings, and your worker workspace.
            </Text>
          </Box>
          {meErrorMessage ? (
            <Text color="red.400" fontSize="sm">
              {meErrorMessage}
            </Text>
          ) : null}
          <SectionCard heading="Sign in to open your dashboard">
            <Text color="formLabelMuted">
              You need an account for the worker workspace. To post tasks or
              manage customer requests, use the main site.
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Link
                as={NextLink}
                href="/login"
                _hover={{ textDecoration: 'none' }}
              >
                <Button>Log in</Button>
              </Link>
              <Link
                as={NextLink}
                href="/register"
                _hover={{ textDecoration: 'none' }}
              >
                <Button variant="secondary">Register</Button>
              </Link>
            </HStack>
          </SectionCard>
          <Link
            as={NextLink}
            href="/"
            fontSize="sm"
            color="formLabelMuted"
            _hover={{ color: 'cardFg' }}
          >
            ← Back to home
          </Link>
        </Stack>
      </Box>
    )
  }

  const activeNav = resolveActiveNav(pathname)

  return (
    <DashboardShell
      activeNav={activeNav}
      searchValue={search}
      onSearchChange={setSearch}
      userLabel={displayName}
      userInitial={userInitial}
      userStatus={
        workerProfileComplete
          ? 'Worker tools unlocked'
          : workerEnabled
            ? 'Finish worker profile'
            : 'Complete worker setup'
      }
      userMeta={me?.email ?? ''}
      workerEnabled={workerEnabled}
      workerProfileComplete={workerProfileComplete}
      headerAction={
        <HStack gap={2} flexWrap="wrap">
          <Link
            as={NextLink}
            href="/dashboard"
            onClick={() => refetchDashboardData()}
            color="formLabelMuted"
            _hover={{ color: 'cardFg' }}
          >
            Refresh
          </Link>
          <Link
            as={NextLink}
            href="/logout"
            color="formLabelMuted"
            _hover={{ color: 'cardFg' }}
          >
            Log out
          </Link>
        </HStack>
      }
    >
      {children}
    </DashboardShell>
  )
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <DashboardDataProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </DashboardDataProvider>
  )
}
