'use client'

import { Box, Grid, HStack, Stack } from '@chakra-ui/react'

import { formatTaskContactMethodLabel } from '@/utils/taskLocationDisplay'
import { Heading, Text } from '@chakra-ui/react'

import { IconDocument } from '@/icons/taskMeta'
import { Card } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

function formatPaymentMethod(paymentMethod: string) {
  const normalised = paymentMethod.replaceAll('_', ' ').toLowerCase()
  return normalised.charAt(0).toUpperCase() + normalised.slice(1)
}

export function TaskDetailDescriptionCard() {
  const { task } = useTaskDetail()
  if (!task) return null

  return (
    <Card p={{ base: 5, md: 6 }} maxW="full" w="full">
      <Stack gap={4}>
        <HStack gap={2}>
          <IconDocument color="primary.600" />
          <Heading size="md">Description</Heading>
        </HStack>
        <Text color="formLabelMuted" lineHeight="tall">
          {task.description}
        </Text>
        {task.budget?.paymentMethod || task.contactMethod ? (
          <Stack
            gap={2}
            fontSize="sm"
            pt={2}
            borderTopWidth="1px"
            borderColor="cardBorder"
          >
            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }}
              gap={3}
            >
              {task.budget?.paymentMethod ? (
                <Text color="formLabelMuted">
                  <Text as="span" fontWeight={600} color="cardFg">
                    Payment:{' '}
                  </Text>
                  {formatPaymentMethod(task.budget.paymentMethod)}
                </Text>
              ) : null}
              {task.contactMethod ? (
                <Text color="formLabelMuted">
                  <Text as="span" fontWeight={600} color="cardFg">
                    Contact:{' '}
                  </Text>
                  {formatTaskContactMethodLabel(task.contactMethod)}
                </Text>
              ) : null}
            </Grid>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
