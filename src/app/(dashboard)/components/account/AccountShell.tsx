'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import bag from '../../i11n.json'

import { DashboardSectionNav, Header } from '@/ui/Header'
import { Button, Footer, Link } from '@ui'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { isWorkerSetupComplete } from '@/app/(worker)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { formatMessage } from '@/i18n/loadPageI11n'

import { resolveAccountNavKey } from '@/utils/accountNav'

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

/** Unified account hub shell — fixed header + nav; only main content scrolls. */
export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname()
  const t = useI11n(bag)
  const active = resolveAccountNavKey(pathname)
  const me = useUserStore((state) => state.me)
  if (!me) return null
  const completion = completionFromMe(me)
  const setupComplete = isWorkerSetupComplete(me)
  const profileLinkLabel = setupComplete
    ? t.shell.manageProfile
    : t.shell.continueSetup
  const profileLinkHref = setupComplete
    ? '/profile'
    : workerSetupHref(pathname ?? '/profile')

  return (
    <Box
      h="100dvh"
      bg="bg.subtle"
      color="text.default"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Header flexShrink={0} zIndex={30} />

      <Box flex="1" minH={0} display="flex" overflow="hidden">
        <Box
          display={{ base: 'none', lg: 'flex' }}
          w="280px"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor="border.default"
          bg="bg.canvas"
          flexDirection="column"
          overflowY="auto"
        >
          <Stack py={6} px={5} gap={6} flex="1" minH="min-content">
            <DashboardSectionNav active={active} variant="sidebar" />

            <Box mt="auto" display="grid" gap={4}>
              <Stack p={4} gap={3} bg="status.success.soft" borderRadius="xl">
                <Stack gap={0.5}>
                  <Text fontSize="sm" fontWeight={700}>
                    {t.shell.completeProfileTitle}
                  </Text>
                  <Text fontSize="xs" color="status.success.fg">
                    {t.shell.completeProfileDescription}
                  </Text>
                </Stack>

                <Stack gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="status.success.fg">
                      {formatMessage(t.shell.completeCount, {
                        done: completion.done,
                        total: completion.total,
                      })}
                    </Text>
                    <Text
                      fontSize="xs"
                      color="status.success.fg"
                      fontWeight={700}
                    >
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
                      bg="action.primary"
                      w={`${completion.percent}%`}
                    />
                  </Box>
                </Stack>

                <Link
                  href={profileLinkHref}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button size="sm" w="full">
                    {profileLinkLabel}
                  </Button>
                </Link>
              </Stack>

              <Text fontSize="xs" color="text.muted">
                {t.shell.paymentsDisclaimer}
              </Text>
            </Box>
          </Stack>
        </Box>

        <Box
          as="main"
          flex="1"
          minW={0}
          minH={0}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          px={{ base: 4, md: 6, xl: 8 }}
          py={{ base: 5, md: 6 }}
          pb={{ base: 5, lg: 8 }}
        >
          <Box w="full" maxW="1200px" flex="1">
            {children}
          </Box>
          {/* Legal strip stays inside the scroll container: the shell itself
              never scrolls, so the footer surfaces at the end of the content. */}
          <Footer variant="minimal" mt={{ base: 8, md: 10 }} bg="transparent" />
        </Box>
      </Box>
    </Box>
  )
}
