'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCalendar, LuMapPin, LuTag, LuWallet } from 'react-icons/lu'

import {
  MAP_FADE_BOTTOM,
  mapFadeGradient,
} from '@/app/(task)/helpers/marketplaceMap'
import { buildMapboxStaticImageUrl } from '@/utils/mapboxStaticImageUrl'

import { MetaPill } from '../../../components/layout/TaskDetailMeta'

export type EditTaskPreviewCardProps = {
  eyebrow: string
  statusBadge?: ReactNode
  title: string
  description: string
  locationLabel?: string | null
  whenLabel?: string | null
  categoryLabel?: string | null
  budgetLabel?: string | null
  lat?: number | null
  lng?: number | null
  mapboxAccessToken?: string
}

const MAP_FADE_LEFT = mapFadeGradient('left')

/**
 * Live preview of the task as workers see it, styled like the task-detail
 * hero: the map fills the card, a white wash fades in from the left and
 * bottom, and the content sits bottom-left. The static map is oversized and
 * shifted so the pin lands top-right, clear of the text.
 */
export function EditTaskPreviewCard({
  eyebrow,
  statusBadge,
  title,
  description,
  locationLabel,
  whenLabel,
  categoryLabel,
  budgetLabel,
  lat,
  lng,
  mapboxAccessToken,
}: EditTaskPreviewCardProps) {
  const token = mapboxAccessToken?.trim()
  const hasPoint =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  const mapSrc =
    token && hasPoint
      ? buildMapboxStaticImageUrl({
          accessToken: token,
          lat,
          lng,
          width: 640,
          heightPx: 640,
          variant: 'exact',
        })
      : null

  return (
    <Box
      as="section"
      aria-label={eyebrow}
      position="relative"
      w="full"
      minH={{ base: '360px', lg: '420px' }}
      display="flex"
      flexDirection="column"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      overflow="hidden"
      bg="linear-gradient(135deg, #EEF3F0 0%, #DCE6E0 100%)"
      boxShadow="e1"
    >
      {mapSrc ? (
        <img
          src={mapSrc}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            width: '160%',
            height: '160%',
            maxWidth: 'none',
            left: '-10%',
            top: '-55%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <Box
        aria-hidden
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        w="75%"
        bgImage={MAP_FADE_LEFT}
        pointerEvents="none"
      />
      <Box
        aria-hidden
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        h="75%"
        bgImage={MAP_FADE_BOTTOM}
        pointerEvents="none"
      />

      <Box position="relative" px={5} pt={4}>
        <Text
          as="span"
          display="inline-block"
          px={2.5}
          py={1}
          borderRadius="full"
          bg="whiteAlpha.800"
          fontSize="xs"
          fontWeight={700}
          letterSpacing="0.06em"
          textTransform="uppercase"
          color="text.muted"
        >
          {eyebrow}
        </Text>
      </Box>

      <Stack
        position="relative"
        mt="auto"
        gap={3}
        px={5}
        pb={5}
        pt={10}
        align="flex-start"
      >
        {statusBadge ? <Box>{statusBadge}</Box> : null}
        <Heading
          as="h2"
          fontFamily="heading"
          fontSize={{ base: 'xl', lg: '2xl' }}
          fontWeight={700}
          lineHeight="1.2"
          color="text.default"
          lineClamp={2}
        >
          {title}
        </Heading>
        <HStack gap={2} flexWrap="wrap">
          {locationLabel ? (
            <MetaPill icon={<LuMapPin size={16} />}>{locationLabel}</MetaPill>
          ) : null}
          {whenLabel ? (
            <MetaPill icon={<LuCalendar size={16} />}>{whenLabel}</MetaPill>
          ) : null}
          {categoryLabel ? (
            <MetaPill icon={<LuTag size={16} />}>{categoryLabel}</MetaPill>
          ) : null}
          {budgetLabel ? (
            <MetaPill icon={<LuWallet size={16} />}>{budgetLabel}</MetaPill>
          ) : null}
        </HStack>
        <Text fontSize="sm" color="text.muted" lineClamp={3}>
          {description}
        </Text>
      </Stack>
    </Box>
  )
}
