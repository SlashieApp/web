'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { IconCalendar } from '@/icons/taskMeta'
import { Button } from '@ui'

import {
  type TaskDetailRecord,
  buildAvailabilityChips,
} from './taskDetailUtils'

export type TaskDetailPreferredAvailabilityProps = {
  task: TaskDetailRecord
}

export function TaskDetailPreferredAvailability({
  task,
}: TaskDetailPreferredAvailabilityProps) {
  const chips = buildAvailabilityChips(task)
  const [activeKey, setActiveKey] = useState(chips[0]?.key ?? '')

  if (chips.length === 0) return null

  return (
    <Box p={{ base: 5, md: 6 }} borderColor="jobCardBorder" boxShadow="ambient">
      <Stack gap={4}>
        <HStack gap={2}>
          <IconCalendar color="primary.600" />
          <Text fontSize="md" fontWeight={700} color="jobCardTitle">
            Preferred availability
          </Text>
        </HStack>
        <HStack
          gap={3}
          overflowX="auto"
          pb={1}
          css={{
            scrollbarGutter: 'stable',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {chips.map((c) => {
            const selected = c.key === activeKey
            return (
              <Button
                key={c.key}
                type="button"
                variant="outline"
                onClick={() => setActiveKey(c.key)}
                flexShrink={0}
                borderRadius="lg"
                borderWidth="2px"
                borderColor={selected ? 'primary.500' : 'border'}
                bg={selected ? 'primary.50' : 'jobCardBg'}
                px={4}
                py={3}
                minW="140px"
                h="auto"
                justifyContent="flex-start"
                fontWeight={400}
                boxShadow="none"
                color="inherit"
                transition="border-color 0.15s ease, background 0.15s ease"
                _hover={{
                  borderColor: selected ? 'primary.500' : 'primary.200',
                  transform: 'none',
                  opacity: 1,
                }}
              >
                <Stack gap={0} align="flex-start" textAlign="left">
                  <Text
                    fontSize="10px"
                    fontWeight={800}
                    letterSpacing="0.08em"
                    color="primary.600"
                  >
                    {c.monthDay}
                  </Text>
                  <Text fontWeight={700} color="jobCardTitle" fontSize="sm">
                    {c.title}
                  </Text>
                  <Text fontSize="xs" color="formLabelMuted">
                    {c.subtitle}
                  </Text>
                </Stack>
              </Button>
            )
          })}
        </HStack>
      </Stack>
    </Box>
  )
}
