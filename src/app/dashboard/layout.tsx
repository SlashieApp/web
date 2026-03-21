'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  DashboardDataProvider,
  useDashboardData,
} from '@/features/dashboard/DashboardDataContext'
import { clearAuthToken } from '@/utils/auth'
import {
  Button,
  type DashboardNavKey,
  DashboardShell,
  GlassCard,
  Heading,
  Text,
} from '@ui'

function resolveActiveNav(pathname: string): DashboardNavKey {
  if (pathname.startsWith('/dashboard/jobs')) return 'jobs'
  if (pathname.startsWith('/dashboard/quotes')) return 'quotes'
  if (pathname.startsWith('/dashboard/earnings')) return 'earnings'
  if (pathname.startsWith('/dashboard/history')) return 'history'
  if (pathname.startsWith('/dashboard/messages')) return 'messages'
  if (pathname.startsWith('/dashboard/profile')) return 'profile'
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
  } = useDashboardData()

  if (!meLoading && !me) {
    return (
      <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }} px={4}>
        <Stack gap={8} maxW="lg" mx="auto">
          <Box>
            <Heading size="lg">Dashboard</Heading>
            <Text color="muted" mt={2}>
              Sign in to manage posted jobs, track quotes, and unlock worker
              tools.
            </Text>
          </Box>
          {meErrorMessage ? (
            <Text color="red.400" fontSize="sm">
              {meErrorMessage}
            </Text>
          ) : null}
          <GlassCard p={6}>
            <Stack gap={4}>
              <Heading size="md">Sign in to view your dashboard</Heading>
              <Text color="muted">
                You need an account to access jobs, bookings, history, profile,
                and worker registration.
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
        workerEnabled ? 'Verified worker workspace' : 'Customer dashboard'
      }
      userMeta={me?.email ?? ''}
      workerEnabled={workerEnabled}
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
