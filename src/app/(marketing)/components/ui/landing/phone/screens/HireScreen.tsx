'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCalendar, LuCheck, LuHandCoins } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import { PhoneMap } from '../PhoneMap'
import type { PhoneCopy } from '../phoneCopy'
import { DemoPrimary, Hotspot, InitialAvatar, Stars } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

/** The chosen quote in a sheet over the task: accept it, get booked. */
export function HireScreen({
  copy,
  active,
  intro,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const quote = copy.quotes.items[0]
  const t = copy.hire

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
        borderTopRadius="24px"
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
            <Text fontSize="17px" fontWeight={800}>
              {quote.name}
            </Text>
            <HStack gap="4px">
              <Stars filled={5} size={13} />
              <Text fontSize="12px" color="text.muted" fontWeight={600}>
                {quote.rating}{' '}
                {formatMessage(copy.quotes.reviews, { count: quote.reviews })}
              </Text>
            </HStack>
          </Stack>
          <Text fontSize="28px" fontWeight={800} color="status.success.fg">
            {t.price}
          </Text>
        </HStack>

        <Stack gap="8px" fontSize="14px">
          <HStack gap="8px">
            <LuCalendar size={16} aria-hidden />
            <Text fontWeight={600}>{t.when}</Text>
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
            borderRadius="16px"
            bg="status.success.soft"
            borderWidth="1px"
            borderColor="status.success.border"
            css={{ animation: 'rise-in 360ms cubic-bezier(0.2, 0, 0, 1) both' }}
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
              <Text fontSize="15px" fontWeight={700}>
                {t.acceptedTitle}
              </Text>
              <Text fontSize="13px" color="text.muted">
                {t.acceptedBody}
              </Text>
            </Stack>
          </HStack>
        ) : null}

        <Hotspot label={t.accept} onPress={trigger} pulse={!done} w="full">
          <DemoPrimary>
            {done ? <LuCheck size={18} aria-hidden /> : null}
            {done ? t.acceptedTitle : t.accept}
          </DemoPrimary>
        </Hotspot>
      </Stack>
    </Box>
  )
}
