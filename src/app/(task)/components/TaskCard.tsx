'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { LuHeart } from 'react-icons/lu'

import { Avatar, Badge, Button, Card, IconButton, Rating, Thumbnail } from '@ui'

/** Card-shaped task for list/carousel rows (`location` maps to the pin/meta line). */
export type TaskCardTask = {
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

type TaskCardWithTask = {
  task: TaskCardTask
  detailsHref?: string
  detailsCtaLabel?: string
  isActive?: boolean
  onActivate?: () => void
}

type TaskCardLegacy = {
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

export type TaskCardProps = TaskCardWithTask | TaskCardLegacy

function isTaskCardWithTask(props: TaskCardProps): props is TaskCardWithTask {
  return 'task' in props && props.task != null
}

export function TaskCard(props: TaskCardProps) {
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

  if (isTaskCardWithTask(props)) {
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
      isActive={isActive}
      p={2}
      px={3}
      minH={{ base: '124px', md: '132px' }}
      maxW="full"
      bg="cardBg"
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
      <HStack
        gap={{ base: 2.5, md: 4 }}
        align="stretch"
        position="relative"
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
      >
        <IconButton
          type="button"
          variant="ghost"
          aria-label="Save task"
          size="sm"
          position="absolute"
          right={0}
          top={0}
          borderRadius="lg"
          color="formControlIcon"
          flexShrink={0}
          onClick={(e) => e.stopPropagation()}
        >
          <LuHeart size={20} aria-hidden />
        </IconButton>
        <Thumbnail alt={`${title} thumbnail`} src={thumbnailSrc} />
        <Stack flex={1} minW={0} gap={0}>
          <HStack
            justify="space-between"
            align="center"
            gap={2}
            pb={1}
            minW={0}
          >
            <HStack gap={3} flex={1} minW={0} pe={{ base: 8, md: 0 }}>
              {showBadge ? <Badge>{badgeText}</Badge> : null}
              {distanceLabel ? (
                <Text fontSize="xs" color="formLabelMuted" truncate>
                  {distanceLabel}
                </Text>
              ) : null}
            </HStack>
          </HStack>

          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight={700}
            color="cardFg"
            truncate
          >
            {title}
          </Text>

          <Stack direction="row" justify="space-between" align="center" pb={2}>
            <Text
              flex={1}
              minW={0}
              fontSize="xs"
              color="formLabelMuted"
              truncate
            >
              {metaLine}
            </Text>
            <Text
              fontWeight={800}
              fontSize={{ base: 'xl', md: '2xl' }}
              lineHeight="1"
              color="cardAccentFg"
              whiteSpace="nowrap"
              flexShrink={0}
            >
              {priceLabel}
            </Text>
          </Stack>

          <HStack gap={3} minW={0} flexWrap="wrap" rowGap={2}>
            <HStack gap={3} minW={0} flex={1}>
              <Avatar
                name={displayOwnerName}
                src={ownerAvatarSrc}
                label={displayOwnerName}
              />
              {displayRatingLabel ? (
                <Rating value={displayRatingLabel} />
              ) : null}
            </HStack>
            <Link
              as={NextLink}
              href={detailsHref}
              onClick={(e) => e.stopPropagation()}
              _hover={{ textDecoration: 'none' }}
              ml="auto"
            >
              <Button
                size="sm"
                minW={{ base: '100%', md: '106px' }}
                h={9}
                borderRadius="lg"
              >
                {detailsCtaLabel}
              </Button>
            </Link>
          </HStack>
        </Stack>
      </HStack>
    </Card>
  )

  if (onActivate) {
    return (
      <Box
        as="div"
        role="button"
        tabIndex={0}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`${title}. Select to highlight on map.`}
        onClick={onActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onActivate()
          }
        }}
        w="full"
        m={0}
        p={0}
        border="none"
        textAlign="left"
        bg="transparent"
        cursor="pointer"
        style={{ font: 'inherit' }}
      >
        {shell}
      </Box>
    )
  }

  return shell
}
