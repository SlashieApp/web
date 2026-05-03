'use client'

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { Button, Dock, Footer, Header } from '@ui'
import { CustomerAccountProvider, useCustomerAccount } from './context'

function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { me, meLoading, meErrorMessage } = useCustomerAccount()

  if (!meLoading && !me) {
    const nextPath = pathname?.startsWith('/') ? pathname : '/requests'

    return (
      <Box bg="bg" color="cardFg" minH="100vh">
        <Box as="section" px={4} pb={12}>
          <Container>
            <Box p={8} maxW="lg" mx="auto">
              <Stack gap={4}>
                <Heading size="lg">Sign in to continue</Heading>
                <Text color="formLabelMuted">
                  Log in to manage quotes on your tasks, track requests, and
                  edit your customer profile.
                </Text>
                {meErrorMessage ? (
                  <Text color="red.400" fontSize="sm">
                    {meErrorMessage}
                  </Text>
                ) : null}
                <NextLink
                  href={`/login?next=${encodeURIComponent(nextPath)}`}
                  passHref
                  legacyBehavior
                >
                  <Button as="a">Log in</Button>
                </NextLink>
                <NextLink href="/register" passHref legacyBehavior>
                  <Button as="a" variant="ghost">
                    Create account
                  </Button>
                </NextLink>
              </Stack>
            </Box>
          </Container>
        </Box>
        <Footer />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="100dvh">
      <Header />
      <Box as="main" flex={1} display="flex" minH={0} overflow="hidden">
        <Dock />
        <Box flex={1} minW={0} minH={0} overflowY="auto">
          {children}
        </Box>
      </Box>
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
