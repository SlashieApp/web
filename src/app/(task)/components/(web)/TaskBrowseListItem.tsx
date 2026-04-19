'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'

import { Button, Card } from '@ui'
import { useColorModeValue } from '@ui/color-mode'

export type JobCardBadgeVariant = 'emergency' | 'featured' | 'none'

/** Card-shaped task for list/carousel rows (`location` maps to the pin/meta line). */
export type TaskBrowseListCardTask = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  badgeText?: string
  thumbnailSrc?: string
}

type TaskBrowseListItemWithTask = {
  task: TaskBrowseListCardTask
  detailsHref?: string
  detailsCtaLabel?: string
  badgeVariant?: JobCardBadgeVariant
  isActive?: boolean
  onActivate?: () => void
}

type TaskBrowseListItemLegacy = {
  title: string
  description: string
  priceLabel: string
  metaLine: string
  thumbnailSrc?: string
  detailsHref: string
  detailsCtaLabel?: string
  badgeVariant?: JobCardBadgeVariant
  badgeText?: string
  isActive?: boolean
  onActivate?: () => void
}

export type TaskBrowseListItemProps =
  | TaskBrowseListItemWithTask
  | TaskBrowseListItemLegacy

function isTaskBrowseListItemWithTask(
  props: TaskBrowseListItemProps,
): props is TaskBrowseListItemWithTask {
  return 'task' in props && props.task != null
}

export function TaskBrowseListItem(props: TaskBrowseListItemProps) {
  const isActive = props.isActive ?? false
  const onActivate = props.onActivate

  let title: string
  let priceLabel: string
  let metaLine: string
  let thumbnailSrc: string | undefined
  let detailsHref: string
  let badgeVariant: JobCardBadgeVariant
  let badgeText: string | undefined

  if (isTaskBrowseListItemWithTask(props)) {
    const { task } = props
    title = task.title
    priceLabel = task.priceLabel
    metaLine = task.location
    thumbnailSrc = task.thumbnailSrc
    detailsHref = props.detailsHref ?? `/task/${task.id}`
    badgeVariant = props.badgeVariant ?? (task.badgeText ? 'featured' : 'none')
    badgeText = task.badgeText
  } else {
    title = props.title
    priceLabel = props.priceLabel
    metaLine = props.metaLine
    thumbnailSrc = props.thumbnailSrc
    detailsHref = props.detailsHref
    badgeVariant = props.badgeVariant ?? 'none'
    badgeText = props.badgeText
  }

  const showBadge = badgeVariant !== 'none' && Boolean(badgeText?.trim())
  const badgeBg = useColorModeValue(
    badgeVariant === 'emergency'
      ? 'red.50'
      : badgeVariant === 'featured'
        ? 'primary.100'
        : 'badgeBg',
    badgeVariant === 'emergency'
      ? 'red.900'
      : badgeVariant === 'featured'
        ? 'primary.900'
        : 'gray.700',
  )
  const badgeColor = useColorModeValue(
    badgeVariant === 'emergency'
      ? 'red.700'
      : badgeVariant === 'featured'
        ? 'primary.700'
        : 'formLabelMuted',
    badgeVariant === 'emergency'
      ? 'red.100'
      : badgeVariant === 'featured'
        ? 'primary.100'
        : 'gray.200',
  )
  const surfaceBg = useColorModeValue('neutral.100', 'gray.800')
  const activeBorderColor = useColorModeValue(
    'rgba(26,86,219,0.42)',
    'rgba(147,197,253,0.6)',
  )
  const idleBorderColor = useColorModeValue(
    'rgba(148,163,184,0.32)',
    'rgba(148,163,184,0.46)',
  )
  const hoverShadow = useColorModeValue(
    '0 8px 22px rgba(15,23,42,0.12)',
    '0 10px 28px rgba(2,6,23,0.52)',
  )
  const baseShadow = useColorModeValue(
    '0 4px 14px rgba(15,23,42,0.08)',
    '0 5px 18px rgba(2,6,23,0.38)',
  )
  const priceColor = useColorModeValue('primary.700', 'primary.300')
  const thumbFallbackBg = useColorModeValue('badgeBg', 'gray.700')

  const shell = (
    <Card p={2.5} maxW="full">
      <HStack gap={3} align="stretch">
        <Box
          position="relative"
          w="84px"
          h="84px"
          flexShrink={0}
          borderRadius="lg"
          overflow="hidden"
          bg={thumbFallbackBg}
        >
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${title} thumbnail`}
              fill
              sizes="84px"
              style={{ objectFit: 'cover' }}
            />
          ) : null}
        </Box>
        <Stack flex={1} minW={0} gap={1} h="84px">
          <HStack justify="space-between" align="flex-start" gap={2}>
            <Heading
              size="sm"
              color="cardFg"
              lineHeight="1.25"
              flex={1}
              minW={0}
            >
              <Text
                as="span"
                display="block"
                truncate
                fontWeight={700}
                color="inherit"
                fontSize="inherit"
                lineHeight="inherit"
              >
                {title}
              </Text>
            </Heading>
            <Text
              flexShrink={0}
              fontWeight={600}
              fontSize="lg"
              lineHeight="1"
              color={priceColor}
            >
              {priceLabel}
            </Text>
          </HStack>

          <HStack gap={1.5} minW={0}>
            <Text fontSize="sm" color="formLabelMuted" truncate>
              {metaLine}
            </Text>
          </HStack>

          <HStack justify="space-between" align="center" gap={2}>
            {showBadge ? (
              <Text
                as="span"
                display="inline-block"
                fontSize="xs"
                fontWeight={800}
                letterSpacing="0.03em"
                px={2.5}
                py={1}
                borderRadius="full"
                bg={badgeBg}
                color={badgeColor}
                truncate
                maxW="60%"
              >
                {badgeText}
              </Text>
            ) : (
              <Box />
            )}
            <Link
              as={NextLink}
              href={detailsHref}
              onClick={(e) => e.stopPropagation()}
              _hover={{ textDecoration: 'none' }}
            >
              <Button
                as="span"
                px={2}
                mt="auto"
                h="auto"
                fontSize="xs"
                fontWeight={600}
              >
                View details
              </Button>
            </Link>
          </HStack>
        </Stack>
      </HStack>
    </Card>
  )

  if (onActivate) {
    return (
      <button
        type="button"
        onClick={onActivate}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${title}. Select to highlight on map.`}
        style={{
          border: 'none',
          padding: 0,
          margin: 0,
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        {shell}
      </button>
    )
  }

  return shell
}
