import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Logo } from '@ui'

/** Branded full-page message for the root 404 and error screens. */
export function StatusScreen({
  code,
  title,
  body,
  actions,
}: {
  code?: string
  title: string
  body: string
  actions: ReactNode
}) {
  return (
    <Box
      as="main"
      minH="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={12}
      bg="bg.subtle"
    >
      <Stack
        w="full"
        maxW="28rem"
        align="center"
        textAlign="center"
        gap={5}
        p={{ base: 6, md: 8 }}
        bg="bg.surface"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.default"
        boxShadow="e3"
      >
        <Logo />
        {code ? (
          <Text
            fontFamily="display"
            fontSize="5xl"
            fontWeight={800}
            lineHeight={1}
            color="text.link"
            aria-hidden
          >
            {code}
          </Text>
        ) : null}
        <Stack gap={2}>
          <Heading as="h1" fontSize="xl">
            {title}
          </Heading>
          <Text color="text.muted" lineHeight="tall">
            {body}
          </Text>
        </Stack>
        <Stack w="full" gap={2}>
          {actions}
        </Stack>
      </Stack>
    </Box>
  )
}
