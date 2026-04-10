'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'

import { Button, Heading, IconMapPin, Text } from '@ui'

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

function badgeStyles(variant: JobCardBadgeVariant) {
  if (variant === 'emergency') return { bg: 'red.50', color: 'red.700' }
  if (variant === 'featured') return { bg: 'primary.100', color: 'primary.700' }
  return { bg: 'surfaceContainerHigh', color: 'muted' }
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
  const { bg: badgeBg, color: badgeColor } = badgeStyles(badgeVariant)

  const shell = (
    <HStack
      gap={3}
      p={2.5}
      align="stretch"
      bg="surfaceContainerLowest"
      borderRadius="2xl"
      boxShadow="0 4px 14px rgba(15,23,42,0.08)"
      borderWidth="1px"
      borderColor={isActive ? 'rgba(26,86,219,0.42)' : 'rgba(148,163,184,0.32)'}
      transition="box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease"
      _hover={
        onActivate
          ? {
              boxShadow: '0 8px 22px rgba(15,23,42,0.12)',
              transform: 'translateY(-1px)',
            }
          : undefined
      }
    >
      <Box
        position="relative"
        w="84px"
        h="84px"
        flexShrink={0}
        borderRadius="lg"
        overflow="hidden"
        bg="surfaceContainerHigh"
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
          <Heading size="sm" color="fg" lineHeight="1.25" flex={1} minW={0}>
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
            color="primary.700"
          >
            {priceLabel}
          </Text>
        </HStack>

        <HStack gap={1.5} minW={0}>
          <IconMapPin />
          <Text fontSize="sm" color="muted" truncate>
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
          <Button
            as={NextLink}
            href={detailsHref}
            px={2}
            mt="auto"
            h="auto"
            fontSize="xs"
            fontWeight={600}
            onClick={(e) => e.stopPropagation()}
          >
            View details
          </Button>
        </HStack>
      </Stack>
    </HStack>
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
