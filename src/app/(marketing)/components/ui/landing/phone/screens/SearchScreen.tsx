'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCrosshair, LuEllipsisVertical, LuSearch } from 'react-icons/lu'

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
  move: { x: 0.47, y: 0.25 },
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
 * The selected task's card, as the app's search draws it: the task's picture
 * (here its icon, the demo has no photos) down the left, its kind as a chip,
 * the title on one line, then the price, how far it is and when, with the
 * card's menu. It is the selected card, so its edge is green.
 */
function TaskCard({
  id,
  copy,
  compact = false,
}: {
  id: DemoTaskId
  copy: PhoneCopy
  compact?: boolean
}) {
  const task = copy.tasks[id]
  // The task's own icon, from the one table.
  const TaskIcon = DEMO_TASK_ICONS[id]
  return (
    <DemoCard
      data-search-card=""
      display="flex"
      alignItems="stretch"
      p={0}
      overflow="hidden"
      borderColor="accent.active"
      boxShadow={sdlElevation.e3}
      css={{
        animation: 'fade-rise 360ms cubic-bezier(0.2, 0, 0, 1) both',
      }}
    >
      <Box
        w={compact ? '64px' : '88px'}
        flexShrink={0}
        bg="bg.subtle"
        color="text.muted"
        display="flex"
        alignItems="center"
        justifyContent="center"
        aria-hidden
      >
        <TaskIcon size={compact ? 22 : 28} />
      </Box>
      <Stack
        gap={compact ? '2px' : '4px'}
        flex={1}
        minW={0}
        p={compact ? '8px 10px' : '12px'}
      >
        <Box
          alignSelf="flex-start"
          px="8px"
          borderRadius="full"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.subtle"
          fontSize={compact ? '11px' : '12px'}
          lineHeight={compact ? '18px' : '20px'}
          fontWeight={500}
          color="text.muted"
        >
          {task.kind}
        </Box>
        <Text
          fontSize={compact ? '13px' : '15px'}
          lineHeight={compact ? '18px' : '20px'}
          fontWeight={500}
          letterSpacing="-0.01em"
          lineClamp={1}
        >
          {task.title}
        </Text>
        <Text
          fontSize={compact ? '11px' : '13px'}
          lineHeight={compact ? '15px' : '18px'}
          color="text.muted"
          lineClamp={1}
        >
          <Text as="span" color="text.default" {...sdlFigure}>
            {task.price}
          </Text>
          {` · ${task.distance} · ${task.when}`}
        </Text>
      </Stack>
      <Box
        pt={compact ? '8px' : '12px'}
        pr={compact ? '6px' : '8px'}
        color="text.muted"
        aria-hidden
      >
        <LuEllipsisVertical size={compact ? 16 : 18} />
      </Box>
    </DemoCard>
  )
}

/**
 * The app's search tab: the logo over the search field, the map with its
 * price pins (the selected one a card with how far the task is), the selected
 * task's card and the Dock. Customers and workers start on one task and tap a
 * pin to see another. `compact` is the cropped phone's layout: the search
 * bar, three pins and the card, all above the crop.
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
            <PricePin
              price={copy.tasks[id].price}
              selected={isSelected}
              caption={copy.tasks[id].distance}
            />
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
            <TaskCard key={selected} id={selected} copy={copy} compact />
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0}>
      <PhoneMap />

      {/* The app's search tab: its logo over the search field. */}
      <Box
        position="absolute"
        top="8px"
        left={0}
        right={0}
        display="flex"
        justifyContent="center"
        zIndex={2}
        aria-hidden
      >
        {/* The wordmark for light surfaces, 1024 by 233. */}
        <img
          src="/images/slashie-logo-light.svg"
          alt=""
          width={114}
          height={26}
        />
      </Box>

      <HStack
        position="absolute"
        top="44px"
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
          <PricePin
            price={copy.tasks[id].price}
            selected={isSelected}
            caption={copy.tasks[id].distance}
          />
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
        <TaskCard key={selected} id={selected} copy={copy} />
      </Box>

      <PhoneTabBar
        copy={copy.nav}
        active="search"
        unread={variant === 'customer' ? 2 : 1}
      />
    </Box>
  )
}
