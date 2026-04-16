'use client'

import { Box, Link, Stack, Text } from '@chakra-ui/react'

export function TaskDetailOwnerHelpCard() {
  return (
    <Box
      p={6}
      borderWidth="0"
      bg="linear-gradient(160deg, #03225a 0%, #012b73 55%, #00358f 100%)"
      color="white"
      boxShadow="ambient"
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontSize="md" fontWeight={700} color="white">
            Need help?
          </Text>
          <Text fontSize="sm" opacity={0.88} lineHeight="tall">
            Our team can help with quotes, payments, or disputes.
          </Text>
        </Stack>
        <Link
          href="mailto:support@handybox.com"
          alignSelf="flex-start"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          py={2}
          borderRadius="lg"
          fontSize="sm"
          fontWeight={700}
          fontFamily="heading"
          bg="white"
          color="primary.800"
          textDecoration="none"
          _hover={{ bg: 'primary.50', textDecoration: 'none' }}
        >
          Chat with support
        </Link>
      </Stack>
    </Box>
  )
}
