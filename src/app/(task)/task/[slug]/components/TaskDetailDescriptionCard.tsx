'use client'

import { Grid, HStack, Stack } from '@chakra-ui/react'

import { formatTaskContactMethodLabel } from '@/utils/taskLocationDisplay'
import { GlassCard, Heading, IconDocument, Text } from '@ui'

import type { TaskDetailRecord } from './taskDetailUtils'

function formatPaymentMethod(paymentMethod: string) {
  const normalised = paymentMethod.replaceAll('_', ' ').toLowerCase()
  return normalised.charAt(0).toUpperCase() + normalised.slice(1)
}

export type TaskDetailDescriptionCardProps = {
  task: TaskDetailRecord
}

export function TaskDetailDescriptionCard({
  task,
}: TaskDetailDescriptionCardProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} borderColor="border" boxShadow="ambient">
      <Stack gap={4}>
        <HStack gap={2}>
          <IconDocument color="primary.600" />
          <Heading size="md">Description</Heading>
        </HStack>
        <Text color="muted" lineHeight="tall">
          {task.description}
        </Text>
        {task.paymentMethod || task.contactMethod ? (
          <Stack
            gap={2}
            fontSize="sm"
            pt={2}
            borderTopWidth="1px"
            borderColor="border"
          >
            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }}
              gap={3}
            >
              {task.paymentMethod ? (
                <Text color="muted">
                  <Text as="span" fontWeight={600} color="fg">
                    Payment:{' '}
                  </Text>
                  {formatPaymentMethod(task.paymentMethod)}
                </Text>
              ) : null}
              {task.contactMethod ? (
                <Text color="muted">
                  <Text as="span" fontWeight={600} color="fg">
                    Contact:{' '}
                  </Text>
                  {formatTaskContactMethodLabel(task.contactMethod)}
                </Text>
              ) : null}
            </Grid>
          </Stack>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
