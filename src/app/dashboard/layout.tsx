'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  DashboardDataProvider,
  useDashboardData,
} from '@/app/dashboard/context'
import { clearAuthToken } from '@/utils/auth'
import { Button, GlassCard, Heading, Text } from '@ui'

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
  const router = useRouter()
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
      <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }} px={4}>
        <Stack gap={8} maxW="lg" mx="auto">
          <Box>
            <Heading size="lg">Worker dashboard</Heading>
            <Text color="muted" mt={2}>
              Sign in to manage quotes, earnings, and your worker workspace.
            </Text>
          </Box>
          {meErrorMessage ? (
            <Text color="red.400" fontSize="sm">
              {meErrorMessage}
            </Text>
          ) : null}
          <GlassCard p={6}>
            <Stack gap={4}>
              <Heading size="md">Sign in to open your dashboard</Heading>
              <Text color="muted">
                You need an account for the worker workspace. Posting tasks and
                customer tools use the main site under Quotes, Requests, and
                Profile.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <Button as={NextLink} href="/login">
                  Log in
                </Button>
                <Button as={NextLink} href="/register" variant="subtle">
                  Register
                </Button>
              </HStack>
            </Stack>
          </GlassCard>
          <Link
            as={NextLink}
            href="/"
            fontSize="sm"
            color="muted"
            _hover={{ color: 'fg' }}
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchDashboardData()}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="subtle"
            onClick={() => {
              clearAuthToken()
              router.push('/login')
            }}
          >
            Log out
          </Button>
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
