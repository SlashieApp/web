'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { Button, Header } from '@ui'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { resolveAccountNavKey } from '../helpers/accountNav'
import { AccountBottomNav, AccountSideNav } from './AccountSideNav'

type AccountShellProps = {
  children: ReactNode
}

function completionFromMe(me: MeSnapshot) {
  const checks = [
    Boolean(me.profile?.name?.trim()),
    Boolean(me.profile?.contactNumber?.trim()),
    Boolean(me.worker?.id),
    Boolean(me.worker?.tagline?.trim()),
    Boolean(me.worker?.locationAddress?.trim()),
  ]
  const done = checks.filter(Boolean).length
  const total = checks.length
  const percent = Math.round((done / total) * 100)
  return {
    percent,
    done,
    total,
    isWorker: Boolean(me.worker?.id),
  }
}

/** Unified account hub shell with desktop rail + mobile bottom navigation. */
export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname()
  const active = resolveAccountNavKey(pathname)
  const me = useUserStore((state) => state.me)
  if (!me) return null
  const completion = completionFromMe(me)
  const profileLinkLabel = completion.isWorker
    ? 'Manage profile'
    : 'Continue setup'
  const profileLinkHref = completion.isWorker
    ? '/profile'
    : '/profile#profile-worker'

  return (
    <Box
      minH="100dvh"
      bg="neutral.100"
      color="cardFg"
      display="flex"
      flexDirection="column"
    >
      <Header activeItem="none" position="sticky" top={0} zIndex={30} />

      <Box flex="1" display="flex" minH={0} overflow="hidden">
        <Box
          display={{ base: 'none', lg: 'flex' }}
          w="280px"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor="cardBorder"
          bg="bg"
          flexDirection="column"
          overflowY="auto"
        >
          <Stack h="full" py={6} px={5} gap={6}>
            <AccountSideNav active={active} />

            <Box mt="auto" display="grid" gap={4}>
              <Stack p={4} gap={3} bg="primary.100" borderRadius="xl">
                <Stack gap={0.5}>
                  <Text fontSize="sm" fontWeight={700}>
                    Complete your profile
                  </Text>
                  <Text fontSize="xs" color="green.800">
                    Stand out and get more work.
                  </Text>
                </Stack>

                <Stack gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="green.800">
                      {completion.done}/{completion.total} complete
                    </Text>
                    <Text fontSize="xs" color="green.800" fontWeight={700}>
                      {completion.percent}%
                    </Text>
                  </HStack>
                  <Box
                    h="6px"
                    borderRadius="full"
                    bg="whiteAlpha.700"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      bg="primary.600"
                      w={`${completion.percent}%`}
                    />
                  </Box>
                </Stack>

                <Link
                  as={NextLink}
                  href={profileLinkHref}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button size="sm" w="full">
                    {profileLinkLabel}
                  </Button>
                </Link>
              </Stack>

              <Text fontSize="xs" color="formLabelMuted">
                Payments are arranged directly between customer and worker
                outside Slashie.
              </Text>
            </Box>
          </Stack>
        </Box>

        <Box
          flex="1"
          minW={0}
          overflowY="auto"
          px={{ base: 4, md: 6, xl: 8 }}
          py={{ base: 5, md: 6 }}
          pb={{ base: 24, lg: 8 }}
        >
          <Box w="full" maxW="1200px">
            {children}
          </Box>
        </Box>
      </Box>

      <AccountBottomNav active={active} />
    </Box>
  )
}
