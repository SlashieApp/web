'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCalendar, LuCheck, LuHandCoins } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlFigure } from '@/theme/styles'

import { PhoneMap } from '../PhoneMap'
import type { PhoneCopy } from '../phoneCopy'
import { DemoPrimary, Hotspot, InitialAvatar, Stars } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

/**
 * The chosen quote in a sheet over the task: accept it, get booked.
 * `compact` is the cropped phone's layout: the sheet pulled up under a strip
 * of the dimmed map, with the booking line under the button once accepted.
 */
export function HireScreen({
  copy,
  active,
  intro,
  compact = false,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  compact?: boolean
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const quote = copy.quotes.items[0]
  const t = copy.hire
  // The button says what it shows: "Accept quote", then "Quote accepted".
  const accept = done ? t.acceptedTitle : t.accept

  if (compact) {
    return (
      <Box position="absolute" inset={0} bg="bg.surface">
        <Box position="absolute" insetInline={0} top={0} h="36px">
          <PhoneMap labels={false} />
          <Box position="absolute" inset={0} bg="bg.overlay" opacity={0.5} />
        </Box>
        <Stack
          position="absolute"
          insetInline={0}
          top="20px"
          gap="12px"
          px="14px"
          pt="8px"
          bg="bg.surface"
          borderTopRadius="14px"
          style={enterStyle(entered, 0, 24)}
        >
          <Box
            alignSelf="center"
            w="36px"
            h="4px"
            borderRadius="full"
            bg="border.strong"
          />
          <HStack gap="10px">
            <InitialAvatar initials={quote.initials} size={40} />
            <Stack gap="1px" flex={1} minW={0}>
              <Text fontSize="14px" fontWeight={500} letterSpacing="-0.01em">
                {quote.name}
              </Text>
              {/* On the narrowest phones the rating goes under the stars, whole. */}
              <HStack gap="4px" rowGap={0} flexWrap="wrap">
                <Stars filled={5} size={11} />
                <Text
                  fontSize="11px"
                  lineHeight="15px"
                  color="text.muted"
                  fontWeight={500}
                  whiteSpace="nowrap"
                >
                  {quote.rating}{' '}
                  {formatMessage(copy.quotes.reviews, { count: quote.reviews })}
                </Text>
              </HStack>
            </Stack>
            <Text fontSize="22px" color="text.default" {...sdlFigure}>
              {t.price}
            </Text>
          </HStack>
          <Stack gap="6px" fontSize="13px" lineHeight="18px">
            <HStack gap="8px">
              <LuCalendar size={14} aria-hidden />
              <Text fontWeight={500}>{t.when}</Text>
            </HStack>
            <HStack gap="8px" align="flex-start" color="text.muted">
              <Box display="inline-flex" pt="2px">
                <LuHandCoins size={14} aria-hidden />
              </Box>
              <Text>{t.note}</Text>
            </HStack>
          </Stack>
          <Hotspot
            label={accept}
            onPress={trigger}
            pulse={!done}
            w="full"
            borderRadius="full"
          >
            <DemoPrimary h="44px" fontSize="14px">
              {done ? <LuCheck size={16} aria-hidden /> : null}
              {accept}
            </DemoPrimary>
          </Hotspot>
          {done ? (
            <Text
              mt="-4px"
              textAlign="center"
              fontSize="11px"
              lineHeight="15px"
              color="text.muted"
              css={{
                textWrap: 'balance',
                animation: 'fade-rise 360ms cubic-bezier(0.2, 0, 0, 1) both',
              }}
            >
              {t.acceptedBody}
            </Text>
          ) : null}
        </Stack>
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0}>
      <PhoneMap />
      <Box position="absolute" inset={0} bg="bg.overlay" opacity={0.5} />

      <Stack
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        gap="14px"
        px="20px"
        pt="10px"
        pb="44px"
        bg="bg.surface"
        borderTopRadius="12px"
        style={enterStyle(entered, 0, 60)}
      >
        <Box
          alignSelf="center"
          w="40px"
          h="5px"
          borderRadius="full"
          bg="border.strong"
        />

        <HStack gap="12px">
          <InitialAvatar initials={quote.initials} size={52} />
          <Stack gap="2px" flex={1}>
            <Text fontSize="17px" fontWeight={500} letterSpacing="-0.01em">
              {quote.name}
            </Text>
            <HStack gap="4px">
              <Stars filled={5} size={13} />
              <Text fontSize="12px" color="text.muted" fontWeight={500}>
                {quote.rating}{' '}
                {formatMessage(copy.quotes.reviews, { count: quote.reviews })}
              </Text>
            </HStack>
          </Stack>
          <Text fontSize="28px" color="text.default" {...sdlFigure}>
            {t.price}
          </Text>
        </HStack>

        <Stack gap="8px" fontSize="14px">
          <HStack gap="8px">
            <LuCalendar size={16} aria-hidden />
            <Text fontWeight={500}>{t.when}</Text>
          </HStack>
          <HStack gap="8px" color="text.muted">
            <LuHandCoins size={16} aria-hidden />
            <Text>{t.note}</Text>
          </HStack>
        </Stack>

        {done ? (
          <HStack
            gap="12px"
            p="14px"
            borderRadius="12px"
            bg="status.success.soft"
            borderWidth="1px"
            borderColor="status.success.border"
            css={{
              animation: 'fade-rise 360ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <LuCheck size={20} aria-hidden />
            </Box>
            <Stack gap={0}>
              <Text fontSize="15px" fontWeight={500}>
                {t.acceptedTitle}
              </Text>
              <Text fontSize="13px" color="text.muted">
                {t.acceptedBody}
              </Text>
            </Stack>
          </HStack>
        ) : null}

        <Hotspot
          label={accept}
          onPress={trigger}
          pulse={!done}
          w="full"
          borderRadius="full"
        >
          <DemoPrimary>
            {done ? <LuCheck size={18} aria-hidden /> : null}
            {accept}
          </DemoPrimary>
        </Hotspot>
      </Stack>
    </Box>
  )
}
