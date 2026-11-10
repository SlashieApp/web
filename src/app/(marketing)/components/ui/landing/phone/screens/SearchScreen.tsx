'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCrosshair, LuMapPin, LuSearch } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlElevation, sdlFigure } from '@/theme/styles'

import { PHONE_CROP_SCREEN_H } from '../PhoneFrame'
import { PhoneMap, PricePin } from '../PhoneMap'
import { DEMO_TASK_ICONS } from '../demoTaskIcons'
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
 * Where the three pins of the `compact` map sit: x as a fraction of the
 * width, y in px from the top (the cropped phone is drawn at 1:1). They clear
 * the search bar above them and the card under them.
 */
const COMPACT_PINS = [
  { x: 0.24, y: 164 },
  { x: 0.72, y: 134 },
  { x: 0.38, y: 100 },
]

/**
 * Map search. Customers start on one task and tap a pin to see another;
 * workers see the same map with "Send quote" on the card. `compact` is the
 * cropped phone's layout: the search bar, three pins and the card, all above
 * the crop.
 */
export function SearchScreen({
  copy,
  active,
  intro,
  variant,
  compact = false,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  variant: 'customer' | 'worker'
  compact?: boolean
}) {
  const { entered, done, trigger } = useDemoBeat(active, intro)
  const [first, second]: DemoTaskId[] =
    variant === 'worker' ? ['paint', 'wardrobe'] : ['move', 'hedge']
  const selected = done ? second : first
  const task = copy.tasks[selected]
  // The same icon the map panel's card gives this task.
  const TaskIcon = DEMO_TASK_ICONS[selected]
  const placeholder =
    variant === 'worker'
      ? copy.search.workerPlaceholder
      : copy.search.placeholder
  const selectPin = formatMessage(copy.search.selectPin, {
    price: copy.tasks[second].price,
  })

  if (compact) {
    const third = ORDER.find((id) => id !== first && id !== second) ?? first
    return (
      <Box position="absolute" inset={0}>
        <PhoneMap labels={false} />

        <HStack
          position="absolute"
          top="8px"
          left="10px"
          right="10px"
          h="40px"
          px="12px"
          gap="8px"
          borderRadius="full"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.strong"
          boxShadow={sdlElevation.e2}
          color="text.muted"
          zIndex={2}
        >
          <LuSearch size={16} aria-hidden />
          <Text flex={1} minW={0} fontSize="13px" color="text.subtle">
            {placeholder}
          </Text>
          <Box color="text.default" display="inline-flex">
            <LuCrosshair size={16} aria-hidden />
          </Box>
        </HStack>

        {[first, second, third].map((id, index) => {
          const isSelected = id === selected
          const pin = (
            <PricePin price={copy.tasks[id].price} selected={isSelected} />
          )
          return (
            <Box
              key={id}
              position="absolute"
              left={`${COMPACT_PINS[index].x * 100}%`}
              top={`${COMPACT_PINS[index].y}px`}
              transform="translate(-50%, -100%)"
              zIndex={isSelected ? 2 : 1}
            >
              <Box style={enterStyle(entered, index, 10)}>
                {id === second ? (
                  <Hotspot label={selectPin} onPress={trigger} pulse={!done}>
                    {pin}
                  </Hotspot>
                ) : (
                  pin
                )}
              </Box>
            </Box>
          )
        })}

        {/* The card rests on a line 14px above the crop, whatever its height. */}
        <Box
          position="absolute"
          left="10px"
          right="10px"
          top={0}
          h={`${PHONE_CROP_SCREEN_H - 14}px`}
          display="flex"
          alignItems="flex-end"
          pointerEvents="none"
          zIndex={3}
        >
          <Box w="full" style={enterStyle(entered, 3, 18)}>
            <DemoCard
              key={selected}
              data-search-card=""
              p="10px"
              borderWidth={0}
              boxShadow={sdlElevation.e3}
              css={{
                animation: 'fade-rise 360ms cubic-bezier(0.2, 0, 0, 1) both',
              }}
            >
              <HStack gap="10px" align="flex-start">
                <Text
                  flex={1}
                  minW={0}
                  fontSize="13px"
                  lineHeight="18px"
                  fontWeight={500}
                  letterSpacing="-0.01em"
                >
                  {task.title}
                </Text>
                <Text
                  fontSize="15px"
                  lineHeight="18px"
                  color="text.default"
                  {...sdlFigure}
                >
                  {task.price}
                </Text>
              </HStack>
              {/* On the narrowest phones "Send quote" goes under the line, whole. */}
              <HStack
                mt="4px"
                gap="10px"
                rowGap="6px"
                flexWrap="wrap"
                justify="space-between"
              >
                <HStack
                  gap="4px"
                  color="text.muted"
                  fontSize="11px"
                  lineHeight="15px"
                  whiteSpace="nowrap"
                >
                  <LuMapPin size={11} aria-hidden />
                  <Text>{task.area}</Text>
                  <Text aria-hidden>·</Text>
                  <Text>
                    {formatMessage(copy.search.quotes, { count: task.quotes })}
                  </Text>
                </HStack>
                {variant === 'worker' ? (
                  <Box
                    ml="auto"
                    px="10px"
                    py="4px"
                    borderRadius="full"
                    bg="action.primary"
                    color="text.onGreen"
                    fontSize="11px"
                    lineHeight="15px"
                    fontWeight={500}
                    whiteSpace="nowrap"
                  >
                    {copy.search.sendQuote}
                  </Box>
                ) : null}
              </HStack>
            </DemoCard>
          </Box>
        </Box>
      </Box>
    )
  }

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
        borderRadius="full"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.strong"
        boxShadow={sdlElevation.e2}
        color="text.muted"
        zIndex={2}
      >
        <LuSearch size={20} aria-hidden />
        <Text flex={1} fontSize="16px" color="text.subtle">
          {placeholder}
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
                <Hotspot label={selectPin} onPress={trigger} pulse={!done}>
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
          data-search-card=""
          display="flex"
          gap="12px"
          alignItems="center"
          p="12px"
          borderWidth={0}
          boxShadow={sdlElevation.e3}
          css={{
            animation: 'fade-rise 360ms cubic-bezier(0.2, 0, 0, 1) both',
          }}
        >
          <Box
            w="56px"
            h="56px"
            flexShrink={0}
            borderRadius="8px"
            bg="bg.subtle"
            color="text.muted"
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-hidden
          >
            <TaskIcon size={24} />
          </Box>
          <Stack gap="2px" flex={1} minW={0}>
            <Text
              fontSize="15px"
              fontWeight={500}
              letterSpacing="-0.01em"
              lineClamp={1}
            >
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
            <Text fontSize="18px" color="text.default" {...sdlFigure}>
              {task.price}
            </Text>
            {variant === 'worker' ? (
              <Box
                px="12px"
                py="5px"
                borderRadius="full"
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
