'use client'

import { Box, Stack } from '@chakra-ui/react'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { Heading, Text } from '@ui'

export type CreateTaskSubmitPanelProps = {
  loading?: boolean
  error?: string | null
  onSubmit: () => void
}

export function CreateTaskSubmitPanel({
  loading = false,
  error = null,
  onSubmit,
}: CreateTaskSubmitPanelProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={4}>
        <Heading size="lg">Ready to post?</Heading>
        <Box bg="surfaceContainerLow" borderRadius="md" px={4} py={3}>
          <Text fontWeight={600} fontSize="sm">
            Tip: clear details and precise location usually get faster, better
            offers.
          </Text>
        </Box>
        <Button size="lg" loading={loading} onClick={onSubmit}>
          Post task
        </Button>
        {error ? (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
