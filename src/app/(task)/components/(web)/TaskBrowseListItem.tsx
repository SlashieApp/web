'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'

import { Button, Card } from '@ui'

/** Card-shaped task for list/carousel rows (`location` maps to the pin/meta line). */
export type TaskBrowseListCardTask = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  badgeText?: string
  distanceLabel?: string
  ownerName?: string
  ownerAvatarSrc?: string
  ratingLabel?: string
  thumbnailSrc?: string
}

type TaskBrowseListItemWithTask = {
  task: TaskBrowseListCardTask
  detailsHref?: string
  detailsCtaLabel?: string
  isActive?: boolean
  onActivate?: () => void
}

type TaskBrowseListItemLegacy = {
  title: string
  description: string
  priceLabel: string
  metaLine: string
  distanceLabel?: string
  ownerName?: string
  ownerAvatarSrc?: string
  ratingLabel?: string
  thumbnailSrc?: string
  detailsHref: string
  detailsCtaLabel?: string
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
  let distanceLabel: string | undefined
  let ownerName: string | undefined
  let ownerAvatarSrc: string | undefined
  let ratingLabel: string | undefined
  let thumbnailSrc: string | undefined
  let detailsHref: string
  let badgeText: string | undefined

  if (isTaskBrowseListItemWithTask(props)) {
    const { task } = props
    title = task.title
    priceLabel = task.priceLabel
    metaLine = task.location
    distanceLabel = task.distanceLabel
    ownerName = task.ownerName
    ownerAvatarSrc = task.ownerAvatarSrc
    ratingLabel = task.ratingLabel
    thumbnailSrc = task.thumbnailSrc
    detailsHref = props.detailsHref ?? `/task/${task.id}`
    badgeText = task.badgeText
  } else {
    title = props.title
    priceLabel = props.priceLabel
    metaLine = props.metaLine
    distanceLabel = props.distanceLabel
    ownerName = props.ownerName
    ownerAvatarSrc = props.ownerAvatarSrc
    ratingLabel = props.ratingLabel
    thumbnailSrc = props.thumbnailSrc
    detailsHref = props.detailsHref
    badgeText = props.badgeText
  }

  const detailsCtaLabel = props.detailsCtaLabel ?? 'View details'
  const showBadge = Boolean(badgeText?.trim())
  const displayOwnerName = ownerName?.trim() || 'Task owner'
  const displayRatingLabel = ratingLabel?.trim()

  const shell = (
    <Card
      p={{ base: 2.5, md: 3 }}
      maxW="full"
      bg="cardBg"
      borderColor={isActive ? 'secondary' : 'cardBorder'}
      boxShadow="card"
      transition="box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease"
      _hover={
        onActivate
          ? {
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
              transform: 'translateY(-1px)',
            }
          : undefined
      }
    >
      <HStack gap={{ base: 2.5, md: 3 }} align="stretch">
        <Box
          position="relative"
          w={{ base: '92px', md: '112px' }}
          h={{ base: '92px', md: '112px' }}
          flexShrink={0}
          borderRadius={{ base: 'lg', md: 'xl' }}
          overflow="hidden"
          bg="cardAvatarEmpty"
        >
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={`${title} thumbnail`}
              fill
              sizes="(max-width: 768px) 92px, 112px"
              style={{ objectFit: 'cover' }}
            />
          ) : null}
        </Box>
        <Stack
          flex={1}
          minW={0}
          gap={{ base: 1.5, md: 2 }}
          justify="space-between"
        >
          <HStack justify="space-between" align="center" gap={2}>
            <HStack gap={2} minW={0} flex={1}>
              {showBadge ? (
                <Text
                  as="span"
                  px={{ base: 2, md: 2.5 }}
                  py={{ base: 0.5, md: 1 }}
                  borderRadius="md"
                  bg="primary.100"
                  color="primary.800"
                  fontWeight={700}
                  fontSize="sm"
                  lineHeight="1"
                  whiteSpace="nowrap"
                >
                  {badgeText}
                </Text>
              ) : null}
              {distanceLabel ? (
                <Text fontSize="sm" color="formLabelMuted" truncate>
                  {distanceLabel}
                </Text>
              ) : null}
            </HStack>
            <Box as="span" color="formControlIcon" flexShrink={0} aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <title>Save task</title>
                <path
                  d="M12.62 20.55a1 1 0 0 1-1.24 0C7.1 17.1 4 14.39 4 10.93 4 8.4 6.04 6.5 8.44 6.5c1.53 0 2.95.8 3.56 2.06.61-1.26 2.03-2.06 3.56-2.06C17.96 6.5 20 8.4 20 10.93c0 3.46-3.1 6.17-7.38 9.62Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
          </HStack>

          <Heading
            size={{ base: 'md', md: 'lg' }}
            color="cardFg"
            lineHeight={{ base: '1.25', md: '1.2' }}
            truncate
          >
            {title}
          </Heading>

          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="formLabelMuted"
            truncate
          >
            {metaLine}
          </Text>

          <HStack
            justify="space-between"
            align="center"
            gap={{ base: 2, md: 3 }}
          >
            <HStack minW={0} gap={{ base: 1.5, md: 2 }} flex={1}>
              <Box
                w={{ base: 6, md: 7 }}
                h={{ base: 6, md: 7 }}
                borderRadius="full"
                overflow="hidden"
                bg="cardAvatarEmpty"
                flexShrink={0}
              >
                {ownerAvatarSrc ? (
                  <Image
                    src={ownerAvatarSrc}
                    alt={`${displayOwnerName} avatar`}
                    width={24}
                    height={24}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : null}
              </Box>
              <Text fontSize="sm" fontWeight={600} color="cardMutedFg" truncate>
                {displayOwnerName}
              </Text>
              {displayRatingLabel ? (
                <HStack gap={1} flexShrink={0}>
                  <Text
                    as="span"
                    color="mustard.400"
                    fontSize="sm"
                    lineHeight="1"
                  >
                    ★
                  </Text>
                  <Text fontSize="sm" fontWeight={600} color="cardMutedFg">
                    {displayRatingLabel}
                  </Text>
                </HStack>
              ) : null}
            </HStack>
            <Stack gap={1} flexShrink={0} align="flex-end">
              <Text
                fontWeight={800}
                fontSize={{ base: '2xl', md: '3xl' }}
                lineHeight="1"
                color="cardAccentFg"
                whiteSpace="nowrap"
              >
                {priceLabel}
              </Text>
              <Link
                as={NextLink}
                href={detailsHref}
                onClick={(e) => e.stopPropagation()}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" minW={{ base: '100px', md: '112px' }}>
                  {detailsCtaLabel}
                </Button>
              </Link>
            </Stack>
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
