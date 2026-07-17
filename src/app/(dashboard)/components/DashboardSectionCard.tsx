'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuPencil } from 'react-icons/lu'

import { Button, Card } from '@ui'

export function DashboardSectionCard({
  id,
  title,
  description,
  icon,
  onEdit,
  editLabel = 'Edit',
  children,
}: {
  id?: string
  title: string
  description?: string
  icon?: ReactNode
  onEdit?: () => void
  editLabel?: string
  children: ReactNode
}) {
  return (
    <Card
      id={id}
      layout="section"
      p={{ base: 4, md: 5 }}
      scrollMarginTop="96px"
      header={
        <HStack justify="space-between" align="flex-start" gap={3} w="full">
          <HStack gap={3} align="flex-start" minW={0}>
            {icon}
            <Stack gap={0.5} minW={0}>
              <Heading as="h2" fontSize="md" fontWeight={600}>
                {title}
              </Heading>
              {description ? (
                <Text fontSize="xs" color="text.muted">
                  {description}
                </Text>
              ) : null}
            </Stack>
          </HStack>
          {onEdit ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onEdit}
              flexShrink={0}
            >
              <LuPencil size={14} aria-hidden />
              {editLabel}
            </Button>
          ) : null}
        </HStack>
      }
    >
      {children}
    </Card>
  )
}

export function DashboardDetailRow({
  label,
  value,
  trailing,
}: {
  label: string
  value: ReactNode
  trailing?: ReactNode
}) {
  return (
    <HStack justify="space-between" gap={4} align="flex-start">
      <Text fontSize="sm" color="text.muted" minW={{ md: '132px' }}>
        {label}
      </Text>
      <HStack gap={2} justify="flex-end" minW={0}>
        <Text
          as="div"
          fontSize="sm"
          color="text.default"
          textAlign="right"
          minW={0}
        >
          {value}
        </Text>
        {trailing}
      </HStack>
    </HStack>
  )
}
