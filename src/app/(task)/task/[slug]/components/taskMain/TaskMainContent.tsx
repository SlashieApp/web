'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { IconCalendar, IconDocument } from '@/icons/taskMeta'
import { formatTaskContactMethodLabel } from '@/utils/taskLocationDisplay'
import { Button, Card, ImageGallery, type ImageGalleryItem } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskDetailRecord,
  buildAvailabilityChips,
} from '../taskDetailUtils'

function formatPaymentMethod(paymentMethod: string) {
  const normalised = paymentMethod.replaceAll('_', ' ').toLowerCase()
  return normalised.charAt(0).toUpperCase() + normalised.slice(1)
}

function posterDisplayName(task: TaskDetailRecord): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  const first = task.poster?.firstName?.trim() ?? ''
  const last = task.poster?.lastName?.trim() ?? ''
  const combined = `${first} ${last}`.trim()
  return combined || 'Task owner'
}

export function TaskMainContent() {
  const { task } = useTaskDetail()
  if (!task) return null

  const photoItems: ImageGalleryItem[] = (task.images ?? [])
    .filter((src): src is string => Boolean(src?.trim()))
    .map((src) => ({ src, alt: task.title }))

  const chips = buildAvailabilityChips(task)
  const [activeKey, setActiveKey] = useState(chips[0]?.key ?? '')

  const posterName = posterDisplayName(task)
  const posterInitials =
    posterName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'TO'

  return (
    <Stack gap={{ base: 6, lg: 8 }}>
      <Stack gap={3}>
        <Text
          fontSize="sm"
          fontWeight={700}
          color="formLabelMuted"
          letterSpacing="0.06em"
        >
          PHOTOS
        </Text>
        {photoItems.length > 0 ? (
          <ImageGallery items={photoItems} />
        ) : (
          <Text fontSize="sm" color="formLabelMuted">
            No photos yet
          </Text>
        )}
      </Stack>

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
                templateColumns={{
                  base: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                }}
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

      {chips.length > 0 ? (
        <Card p={{ base: 5, md: 6 }} maxW="full" w="full">
          <Stack gap={4}>
            <HStack gap={2}>
              <IconCalendar color="primary.600" />
              <Text fontSize="md" fontWeight={700} color="cardFg">
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
                    variant="secondary"
                    onClick={() => setActiveKey(c.key)}
                    flexShrink={0}
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={selected ? 'primary.500' : 'border'}
                    bg={selected ? 'primary.50' : 'cardBg'}
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
                      <Text fontWeight={700} color="cardFg" fontSize="sm">
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
        </Card>
      ) : null}

      <Card p={{ base: 5, md: 6 }} maxW="full" w="full">
        <HStack align="flex-start" gap={4}>
          <Box
            flexShrink={0}
            boxSize="56px"
            borderRadius="full"
            bg="primary.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="primary.700"
            fontWeight={800}
            fontSize="sm"
          >
            {posterInitials}
          </Box>
          <Stack gap={1} flex={1} minW={0}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="formLabelMuted"
              letterSpacing="0.06em"
            >
              TASK OWNER
            </Text>
            <Heading size="sm" lineHeight="short">
              {posterName}
            </Heading>
          </Stack>
        </HStack>
      </Card>
    </Stack>
  )
}
