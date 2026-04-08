'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button, Heading, IconMapPin, Text } from '@ui'

export type JobCardBadgeVariant = 'emergency' | 'featured' | 'none'

export type TaskBrowseListItemProps = {
  title: string
  description: string
  priceLabel: string
  metaLine: string
  detailsHref: string
  detailsCtaLabel?: string
  badgeVariant?: JobCardBadgeVariant
  badgeText?: string
  isActive?: boolean
  onActivate?: () => void
}

function badgeStyles(variant: JobCardBadgeVariant) {
  if (variant === 'emergency') return { bg: 'red.50', color: 'red.700' }
  if (variant === 'featured') return { bg: 'primary.100', color: 'primary.700' }
  return { bg: 'surfaceContainerHigh', color: 'muted' }
}

export function TaskBrowseListItem({
  title,
  description,
  priceLabel,
  metaLine,
  detailsHref,
  detailsCtaLabel = 'View Details',
  badgeVariant = 'none',
  badgeText,
  isActive = false,
  onActivate,
}: TaskBrowseListItemProps) {
  const showBadge = badgeVariant !== 'none' && Boolean(badgeText?.trim())
  const { bg: badgeBg, color: badgeColor } = badgeStyles(badgeVariant)

  const shell = (
    <Stack
      gap={3}
      p={5}
      bg="surfaceContainerLowest"
      borderRadius="2xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={isActive ? 'primary.500' : 'border'}
      transition="box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease"
      _hover={
        onActivate
          ? {
              boxShadow: 'ambient',
              transform: 'translateY(-1px)',
            }
          : undefined
      }
    >
      <HStack
        align="flex-start"
        justify={showBadge ? 'space-between' : 'flex-end'}
        gap={3}
      >
        {showBadge ? (
          <Text
            as="span"
            display="inline-block"
            fontSize="xs"
            fontWeight={800}
            letterSpacing="0.06em"
            textTransform="uppercase"
            px={2.5}
            py={1}
            borderRadius="full"
            bg={badgeBg}
            color={badgeColor}
          >
            {badgeText}
          </Text>
        ) : (
          <Box flex={1} minW={0} aria-hidden />
        )}
        <Text
          flexShrink={0}
          fontWeight={800}
          fontSize="lg"
          lineHeight="shorter"
          color="primary.700"
        >
          {priceLabel}
        </Text>
      </HStack>

      <Stack gap={1.5}>
        <Heading size="sm" color="fg" lineHeight="snug">
          {title}
        </Heading>
        <Text
          fontSize="sm"
          color="muted"
          lineHeight="1.5"
          css={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Text>
      </Stack>

      <HStack justify="space-between" align="center" gap={3} pt={1}>
        <HStack gap={1.5} minW={0}>
          <IconMapPin />
          <Text fontSize="sm" color="muted" truncate>
            {metaLine}
          </Text>
        </HStack>
        <Button
          as={NextLink}
          href={detailsHref}
          size="sm"
          px={4}
          borderRadius="lg"
          onClick={(e) => e.stopPropagation()}
        >
          {detailsCtaLabel}
        </Button>
      </HStack>
    </Stack>
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
