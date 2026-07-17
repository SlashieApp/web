'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
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
        <HStack gap={3} align="flex-start" w="full">
          {icon ? (
            <Box
              aria-hidden
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              boxSize="40px"
              borderRadius="lg"
              bg="status.success.soft"
              color="status.success.fg"
              fontSize="20px"
              lineHeight="1"
            >
              {icon}
            </Box>
          ) : null}

          <Stack gap={0.5} flex={1} minW={0}>
            <HStack
              justify="space-between"
              align="center"
              gap={3}
              w="full"
              minH="40px"
            >
              <Heading
                as="h2"
                fontSize="md"
                fontWeight={600}
                lineHeight="short"
              >
                {title}
              </Heading>
              {onEdit ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onEdit}
                  flexShrink={0}
                  minH="40px"
                >
                  <LuPencil size={14} aria-hidden />
                  {editLabel}
                </Button>
              ) : null}
            </HStack>
            {description ? (
              <Text fontSize="xs" color="text.muted">
                {description}
              </Text>
            ) : null}
          </Stack>
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
    <HStack justify="space-between" gap={4} align="center">
      <Text fontSize="sm" color="text.muted" minW={{ md: '132px' }}>
        {label}
      </Text>
      <HStack gap={2} justify="flex-end" align="center" minW={0}>
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
