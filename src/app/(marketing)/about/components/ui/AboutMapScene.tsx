import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuMessageSquare } from 'react-icons/lu'

import { PricePin } from '@/app/(marketing)/components/ui/landing/phone/PhoneMap'
import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'
import {
  MAP_MAJOR_ROADS,
  MAP_MINOR_STREETS,
  MAP_PARKS,
  MAP_RIVER,
  MAP_VIEWBOX,
} from '@/app/(marketing)/components/ui/landing/stage/stageMapArt'
import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlElevation, sdlFigure } from '@/theme/styles'

const token = (name: string) => `var(--chakra-colors-${name})`

/**
 * The landing's quiet city sketch (`stageMapArt`, the map behind Home's
 * hero), drawn in neutral tokens only, as the hero stage's stylesheet draws
 * it: land `bg.subtle`, parks and the river `border.default`, streets and
 * roads `bg.surface` with a hairline casing. No green.
 */
function CityMap() {
  return (
    <svg
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <rect
        width={MAP_VIEWBOX.width}
        height={MAP_VIEWBOX.height}
        fill={token('bg-subtle')}
      />
      {MAP_MINOR_STREETS.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={token('bg-surface')}
          strokeWidth={3}
        />
      ))}
      {MAP_PARKS.map((park) => (
        <rect
          key={`${park.x}-${park.y}`}
          x={park.x}
          y={park.y}
          width={park.width}
          height={park.height}
          rx={park.radius}
          fill={token('border-default')}
        />
      ))}
      <path
        d={MAP_RIVER}
        fill="none"
        stroke={token('border-default')}
        strokeWidth={46}
        strokeLinecap="round"
      />
      {MAP_MAJOR_ROADS.map((d) => (
        <path
          key={`casing-${d}`}
          d={d}
          fill="none"
          stroke={token('border-default')}
          strokeWidth={11}
          strokeLinecap="round"
        />
      ))}
      {MAP_MAJOR_ROADS.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={token('bg-surface')}
          strokeWidth={9}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

type TaskId = keyof PhoneCopy['tasks']

/**
 * Where each task's pin stands, as fractions of the scene: the pin's dot is
 * the spot. `phone` false leaves a pin out below `md`, where the task card
 * takes the foot of the scene.
 */
const PINS: { id: TaskId; x: number; y: number; phone: boolean }[] = [
  { id: 'move', x: 0.16, y: 0.3, phone: true },
  { id: 'wardrobe', x: 0.36, y: 0.2, phone: false },
  { id: 'paint', x: 0.25, y: 0.76, phone: false },
  { id: 'clean', x: 0.84, y: 0.86, phone: true },
]

/** The selected task: its pin, and its card beside it (under it on a phone). */
const SELECTED = { id: 'hedge' as const, x: 0.52, y: 0.44 }

/** The phone layout puts the selected pin a little higher, clear of the card. */
const PHONE_SELECTED_Y = 0.32
const PHONE_CLEAN = { x: 0.82, y: 0.14 }

const at = (x: number, y: number) => ({
  left: `${x * 100}%`,
  top: `${y * 100}%`,
})

/**
 * About's hero scene (FE-554): "a map-first marketplace for local tasks",
 * shown. The landing's city sketch with nearby tasks as the app's price pins,
 * one selected, its card beside it: what it is, where and when, and how many
 * quotes it has. All the words are Home's demo copy (`landing.phone`).
 *
 * A still, server-rendered: it rises in with the hero (`riseIn`), so it adds
 * no motion of its own. The map and the pins are decoration; the card is the
 * part a screen reader reads.
 */
export function AboutMapScene({ phone }: { phone: PhoneCopy }) {
  const selected = phone.tasks[SELECTED.id]
  return (
    <Box
      data-about-map=""
      position="relative"
      h={{ base: '340px', md: '400px', lg: '440px' }}
      overflow="hidden"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="2xl"
      boxShadow={sdlElevation.e1}
    >
      <CityMap />

      <Box aria-hidden>
        {PINS.map((pin) => {
          const phonePlace =
            pin.id === 'clean' ? PHONE_CLEAN : { x: pin.x, y: pin.y }
          return (
            <Box
              key={pin.id}
              data-about-pin={pin.id}
              position="absolute"
              display={{ base: pin.phone ? 'block' : 'none', md: 'block' }}
              left={{
                base: at(phonePlace.x, 0).left,
                md: at(pin.x, 0).left,
              }}
              top={{
                base: at(0, phonePlace.y).top,
                md: at(0, pin.y).top,
              }}
              transform="translate(-50%, -100%)"
            >
              <PricePin price={phone.tasks[pin.id].price} selected={false} />
            </Box>
          )
        })}
        <Box
          data-about-pin={SELECTED.id}
          data-selected=""
          position="absolute"
          left={at(SELECTED.x, 0).left}
          top={{
            base: at(0, PHONE_SELECTED_Y).top,
            md: at(0, SELECTED.y).top,
          }}
          transform="translate(-50%, -100%)"
          zIndex={1}
        >
          <PricePin
            price={selected.price}
            selected
            caption={selected.distance}
          />
        </Box>
      </Box>

      {/* The selected task's card: beside its pin from md, at the foot of
          the scene on a phone. */}
      <Stack
        data-about-map-card=""
        position="absolute"
        zIndex={2}
        gap={2.5}
        p={4}
        textAlign="start"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        boxShadow={sdlElevation.e3}
        left={{ base: 4, md: `calc(${SELECTED.x * 100}% + 72px)` }}
        right={{ base: 4, md: 'auto' }}
        bottom={{ base: 4, md: 'auto' }}
        top={{ md: `calc(${SELECTED.y * 100}% - 96px)` }}
        w={{ md: '18rem' }}
      >
        <Text
          as="span"
          alignSelf="flex-start"
          px={2}
          py={0.5}
          textStyle="text-xs"
          fontWeight={500}
          color="text.muted"
          bg="bg.subtle"
          borderRadius="full"
        >
          {selected.kind}
        </Text>
        <Text textStyle="text-sm" fontWeight={500} lineClamp={2}>
          {selected.title}
        </Text>
        <Text textStyle="text-xs" color="text.muted">
          {selected.area} · {selected.when}
        </Text>
        <HStack
          justify="space-between"
          pt={2.5}
          borderTopWidth="1px"
          borderColor="border.default"
        >
          <HStack gap={1.5} color="text.muted">
            <LuMessageSquare size={14} aria-hidden />
            <Text as="span" textStyle="text-xs">
              {formatMessage(phone.search.quotes, { count: selected.quotes })}
            </Text>
          </HStack>
          <Text as="span" fontSize="15px" lineHeight="20px" {...sdlFigure}>
            {selected.price}
          </Text>
        </HStack>
      </Stack>
    </Box>
  )
}
