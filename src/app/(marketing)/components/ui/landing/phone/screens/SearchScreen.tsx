'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCrosshair, LuMapPin, LuSearch, LuSprout } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlElevation } from '@/theme/styles'

import { PhoneMap, PricePin } from '../PhoneMap'
import type { DemoTaskId, PhoneCopy } from '../phoneCopy'
import { DemoCard, Hotspot, PhoneTabBar } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'

/** Pin positions as fractions of the map (kept clear of the bottom card). */
const PINS: Record<DemoTaskId, { x: number; y: number }> = {
  move: { x: 0.47, y: 0.2 },
  wardrobe: { x: 0.76, y: 0.27 },
  paint: { x: 0.2, y: 0.5 },
  hedge: { x: 0.6, y: 0.63 },
  clean: { x: 0.86, y: 0.49 },
}

const ORDER: DemoTaskId[] = ['move', 'wardrobe', 'paint', 'hedge', 'clean']

/**
 * Map search. Customers start on one task and tap a pin to see another;
 * workers see the same map with "Send quote" on the card.
 */
export function SearchScreen({
  copy,
  active,
  intro,
  variant,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  variant: 'customer' | 'worker'
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const [first, second]: DemoTaskId[] =
    variant === 'worker' ? ['paint', 'wardrobe'] : ['move', 'hedge']
  const selected = done ? second : first
  const task = copy.tasks[selected]

  return (
    <Box position="absolute" inset={0}>
      <PhoneMap />

      <HStack
        position="absolute"
        top="6px"
        left="16px"
        right="16px"
        h="50px"
        px="16px"
        gap="10px"
        borderRadius="14px"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        boxShadow={sdlElevation.e2}
        color="text.muted"
        zIndex={2}
      >
        <LuSearch size={20} aria-hidden />
        <Text flex={1} fontSize="16px">
          {variant === 'worker'
            ? copy.search.workerPlaceholder
            : copy.search.placeholder}
        </Text>
        <Box color="text.default" display="inline-flex">
          <LuCrosshair size={20} aria-hidden />
        </Box>
      </HStack>

      {ORDER.map((id, index) => {
        const { x, y } = PINS[id]
        const isSelected = id === selected
        const pin = (
          <PricePin price={copy.tasks[id].price} selected={isSelected} />
        )
        return (
          <Box
            key={id}
            position="absolute"
            left={`${x * 100}%`}
            top={`${y * 100}%`}
            transform="translate(-50%, -100%)"
            zIndex={isSelected ? 2 : 1}
          >
            <Box style={enterStyle(entered, index, 10)}>
              {id === second ? (
                <Hotspot
                  label={formatMessage(copy.search.selectPin, {
                    price: copy.tasks[id].price,
                  })}
                  onPress={trigger}
                  pulse={!done}
                >
                  {pin}
                </Hotspot>
              ) : (
                pin
              )}
            </Box>
          </Box>
        )
      })}

      <Box
        position="absolute"
        left="14px"
        right="14px"
        bottom="112px"
        zIndex={3}
        style={enterStyle(entered, ORDER.length, 18)}
      >
        <DemoCard
          key={selected}
          display="flex"
          gap="12px"
          alignItems="center"
          p="12px"
          borderWidth={0}
          boxShadow={sdlElevation.e3}
          css={{
            animation: 'rise-in 360ms cubic-bezier(0.2, 0, 0, 1) both',
          }}
        >
          <Box
            w="64px"
            h="64px"
            flexShrink={0}
            borderRadius="12px"
            bg="status.success.soft"
            color="status.success.fg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-hidden
          >
            <LuSprout size={28} />
          </Box>
          <Stack gap="2px" flex={1} minW={0}>
            <Text fontSize="15px" fontWeight={500} lineClamp={1}>
              {task.title}
            </Text>
            <HStack gap="4px" color="text.muted" fontSize="13px">
              <LuMapPin size={13} aria-hidden />
              <Text>{task.area}</Text>
              <Text aria-hidden>·</Text>
              <Text>
                {formatMessage(copy.search.quotes, { count: task.quotes })}
              </Text>
            </HStack>
          </Stack>
          <Stack gap="6px" align="flex-end" flexShrink={0}>
            <Text
              fontSize="18px"
              fontWeight={600}
              fontVariantNumeric="tabular-nums"
              color="status.success.fg"
            >
              {task.price}
            </Text>
            {variant === 'worker' ? (
              <Box
                px="10px"
                py="5px"
                borderRadius="8px"
                bg="action.primary"
                color="text.onGreen"
                fontSize="12px"
                fontWeight={500}
              >
                {copy.search.sendQuote}
              </Box>
            ) : null}
          </Stack>
        </DemoCard>
      </Box>

      <PhoneTabBar
        copy={copy.nav}
        active="search"
        unread={variant === 'customer' ? 2 : 1}
      />
    </Box>
  )
}
