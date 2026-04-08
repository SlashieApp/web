'use client'

import { Box, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { Button, Footer, GlassCard, Header, Heading, Section, Text } from '@ui'
import { CustomerAccountProvider, useCustomerAccount } from './context'

function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { me, meLoading, meErrorMessage } = useCustomerAccount()

  if (!meLoading && !me) {
    const nextPath = pathname?.startsWith('/') ? pathname : '/requests'

    return (
      <Box bg="surface" color="fg" minH="100vh">
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header />
        </Section>
        <Section px={4} pb={12}>
          <GlassCard p={8} maxW="lg" mx="auto">
            <Stack gap={4}>
              <Heading size="lg">Sign in to continue</Heading>
              <Text color="muted">
                Log in to manage quotes on your tasks, track requests, and edit
                your customer profile.
              </Text>
              {meErrorMessage ? (
                <Text color="red.400" fontSize="sm">
                  {meErrorMessage}
                </Text>
              ) : null}
              <Button
                as={NextLink}
                href={`/login?next=${encodeURIComponent(nextPath)}`}
              >
                Log in
              </Button>
              <Button as={NextLink} href="/register" variant="subtle">
                Create account
              </Button>
            </Stack>
          </GlassCard>
        </Section>
        <Footer />
      </Box>
    )
  }

  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Section id="header" py={{ base: 6, md: 8 }}>
        <Header />
      </Section>
      <Section
        px={{ base: 4, md: 6 }}
        pb={{ base: 10, md: 12 }}
        bg="surfaceContainerLow"
      >
        {meLoading ? (
          <Text color="muted">Loading your account…</Text>
        ) : (
          children
        )}
      </Section>
      <Footer />
    </Box>
  )
}

export default function CustomerSegmentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CustomerAccountProvider>
      <CustomerShell>{children}</CustomerShell>
    </CustomerAccountProvider>
  )
}
