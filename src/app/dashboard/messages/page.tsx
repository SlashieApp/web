'use client'

import { Stack, Text } from '@chakra-ui/react'

import { DashboardPageHeader } from '@/app/dashboard/components/DashboardPageHeader'
import { SectionCard } from '@ui'

export default function DashboardMessagesPage() {
  return (
    <Stack gap={8}>
      <DashboardPageHeader
        title="Messages"
        description="In-app messaging will appear here when chat is connected to the API. For now, use the contact details on each task to coordinate with customers."
      />

      <SectionCard p={6}>
        <Text color="formLabelMuted">
          No conversations yet. This workspace is reserved for worker–customer
          threads once messaging ships.
        </Text>
      </SectionCard>
    </Stack>
  )
}
