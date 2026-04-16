'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'

export default function DashboardMessagesPage() {
  return (
    <Stack gap={8}>
      <Stack gap={1} maxW="3xl">
        <Heading size="xl">Messages</Heading>
        <Text color="formLabelMuted">
          In-app messaging will appear here when chat is connected to the API.
          For now, use the email and phone details on each task to coordinate
          with customers.
        </Text>
      </Stack>

      <Box p={6}>
        <Text color="formLabelMuted">
          No conversations yet. This workspace is reserved for worker–customer
          threads once messaging ships.
        </Text>
      </Box>
    </Stack>
  )
}
