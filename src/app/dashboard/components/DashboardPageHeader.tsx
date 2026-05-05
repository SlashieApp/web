'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

export function DashboardPageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Stack gap={2} maxW="3xl">
      <Heading size="xl" color="secondary.900">
        {title}
      </Heading>
      <Text color="formLabelMuted">{description}</Text>
    </Stack>
  )
}
