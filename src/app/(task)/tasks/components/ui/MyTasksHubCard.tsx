'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { type KeyboardEvent, useCallback } from 'react'
import {
  LuCalendar,
  LuChevronRight,
  LuMapPin,
  LuUser,
  LuWallet,
} from 'react-icons/lu'

import { Badge, Card, Thumbnail } from '@ui'
import type { MyTaskHubRow, MyTaskSectionId } from '../../helpers/myTasksHub'

export type MyTasksHubCardProps = {
  row: MyTaskHubRow
  timingLabel: string
  detail?: string
  tags: readonly string[]
  statusLabel: string
  section: MyTaskSectionId
  activateAriaLabel: string
  onOpen: (taskId: string) => void
}

function MetaDot() {
  return (
    <Text as="span" color="text.subtle" fontSize="xs" aria-hidden>
      ·
    </Text>
  )
}

export function MyTasksHubCard({
  row,
  timingLabel,
  detail,
  tags,
  statusLabel,
  section,
  activateAriaLabel,
  onOpen,
}: MyTasksHubCardProps) {
  const handleOpen = useCallback(() => {
    onOpen(row.id)
  }, [onOpen, row.id])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      onOpen(row.id)
    },
    [onOpen, row.id],
  )

  const category = row.categoryLabel?.trim()
  const price = row.priceLabel.trim()
  const location = row.location.trim()
  const statusVariant = section === 'completed' ? 'neutral' : 'success'

  return (
    <Card
      interactive
      maxW="full"
      p={{ base: 3, md: 4 }}
      aria-label={activateAriaLabel}
      onClick={handleOpen}
      onKeyDown={onKeyDown}
    >
      <HStack gap={3} align="flex-start">
        <Thumbnail
          alt=""
          src={row.thumbnailSrc}
          size="sm"
          minW="56px"
          w="56px"
          borderRadius="lg"
          alignSelf="flex-start"
          bg="status.success.soft"
          color="status.success.fg"
        />
        <Stack flex={1} minW={0} gap={2}>
          <HStack align="flex-start" justify="space-between" gap={3}>
            <Stack gap={1} minW={0} flex={1}>
              <HStack gap={2} align="center" flexWrap="wrap" minW={0}>
                {category ? (
                  <Text
                    fontSize="sm"
                    fontWeight={600}
                    color="text.link"
                    lineClamp={1}
                  >
                    {category}
                  </Text>
                ) : null}
                {tags.map((tag) => (
                  <Badge key={tag} size="sm" variant="neutral" shape="pill">
                    {tag}
                  </Badge>
                ))}
              </HStack>
              <Text
                fontSize="md"
                fontWeight={700}
                color="text.default"
                lineHeight="1.3"
                lineClamp={2}
              >
                {row.title}
              </Text>
            </Stack>
            <HStack gap={1} flexShrink={0} color="text.muted" pt={0.5}>
              <Badge dot variant={statusVariant} shape="pill" size="sm">
                {statusLabel}
              </Badge>
              <Box as="span" aria-hidden display="inline-flex">
                <LuChevronRight size={18} strokeWidth={2} />
              </Box>
            </HStack>
          </HStack>
          <HStack gap={1.5} flexWrap="wrap" align="center" minW={0}>
            {price ? (
              <HStack gap={1} color="text.default" minW={0}>
                <Box
                  as="span"
                  aria-hidden
                  display="inline-flex"
                  color="text.muted"
                >
                  <LuWallet size={14} strokeWidth={2} />
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight={700}
                  fontVariantNumeric="tabular-nums"
                >
                  {price}
                </Text>
              </HStack>
            ) : null}
            {price && timingLabel ? <MetaDot /> : null}
            {timingLabel ? (
              <HStack gap={1} color="text.muted" minW={0}>
                <Box as="span" aria-hidden display="inline-flex">
                  <LuCalendar size={14} strokeWidth={2} />
                </Box>
                <Text fontSize="sm" lineClamp={1}>
                  {timingLabel}
                </Text>
              </HStack>
            ) : null}
            {location ? (
              <>
                <MetaDot />
                <HStack gap={1} color="text.muted" minW={0}>
                  <Box as="span" aria-hidden display="inline-flex">
                    <LuMapPin size={14} strokeWidth={2} />
                  </Box>
                  <Text fontSize="sm" lineClamp={1}>
                    {location}
                  </Text>
                </HStack>
              </>
            ) : null}
            {detail ? (
              <>
                <MetaDot />
                <HStack gap={1} color="text.muted" minW={0}>
                  <Box as="span" aria-hidden display="inline-flex">
                    <LuUser size={14} strokeWidth={2} />
                  </Box>
                  <Text fontSize="sm" lineClamp={1}>
                    {detail}
                  </Text>
                </HStack>
              </>
            ) : null}
          </HStack>
        </Stack>
      </HStack>
    </Card>
  )
}
