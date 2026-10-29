'use client'

import {
  Box,
  Container,
  HStack,
  Heading,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import { useId, useRef, useState } from 'react'
import type { IconType } from 'react-icons'
import {
  LuHammer,
  LuMapPin,
  LuPackage,
  LuPaintRoller,
  LuSparkles,
  LuSprout,
} from 'react-icons/lu'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import {
  sdlElevation,
  sdlFigure,
  sdlFocusRing,
  sdlMotion,
  sdlOverlaySurface,
} from '@/theme/styles'
import { Badge, Card } from '@ui'

import { Reveal } from '../Reveal'
import type { DemoTaskId, PhoneCopy } from '../phone/phoneCopy'
import {
  MAP_MAJOR_ROADS,
  MAP_MAJOR_ROAD_WIDTH,
  MAP_MINOR_STREETS,
  MAP_MINOR_STREET_WIDTH,
  MAP_PARKS,
  MAP_RIVER,
  MAP_RIVER_WIDTH,
  MAP_VIEWBOX,
} from './mapShowcaseArt'
import {
  CARD_INSET_PX,
  CARD_WIDTH_PX,
  DEFAULT_SHOWCASE_TASK,
  PIN_SPOTS,
  type ShowcaseTask,
  buildShowcaseTasks,
  pickShowcaseTask,
} from './mapShowcaseModel'

/** A token's CSS variable, for the SVG's paint (which takes no style props). */
const color = (token: string) => `var(--chakra-colors-${token})`

/** The icon in the card's tile: what kind of job it is, never a colour. */
const TASK_ICONS: Record<DemoTaskId, IconType> = {
  move: LuPackage,
  wardrobe: LuHammer,
  paint: LuPaintRoller,
  hedge: LuSprout,
  clean: LuSparkles,
}

const PinButton = chakra('button')

/**
 * The drawn map: a monochrome sketch (land, parks, a river, local streets and
 * wide roads with a hairline casing) in neutral tokens, no green and no tiles.
 * Decorative, so hidden from assistive technology.
 */
function MapArt() {
  return (
    <chakra.svg
      position="absolute"
      inset={0}
      w="full"
      h="full"
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
      focusable="false"
      data-map-art=""
    >
      <rect
        width={MAP_VIEWBOX.width}
        height={MAP_VIEWBOX.height}
        fill={color('bg-subtle')}
      />
      {MAP_MINOR_STREETS.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={color('bg-surface')}
          strokeWidth={MAP_MINOR_STREET_WIDTH}
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
          fill={color('border-default')}
        />
      ))}
      <path
        d={MAP_RIVER}
        fill="none"
        stroke={color('border-strong')}
        strokeOpacity={0.75}
        strokeWidth={MAP_RIVER_WIDTH}
        strokeLinecap="round"
      />
      {MAP_MAJOR_ROADS.map((d) => (
        <path
          key={`casing-${d}`}
          d={d}
          fill="none"
          stroke={color('border-default')}
          strokeWidth={MAP_MAJOR_ROAD_WIDTH + 3}
          strokeLinecap="round"
        />
      ))}
      {MAP_MAJOR_ROADS.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={color('bg-surface')}
          strokeWidth={MAP_MAJOR_ROAD_WIDTH}
          strokeLinecap="round"
        />
      ))}
    </chakra.svg>
  )
}

/**
 * One price pin, a real button: a white pill with a hairline, a soft shadow
 * and the price in green 800, over a dot. Selected, it is green 400 with an
 * ink price. The pins are a single choice, not toggles (pressing the chosen
 * one does nothing), so the chosen pin carries `aria-current` for assistive
 * technology, not `aria-pressed`. The area sits under the dot like a map
 * label, in `text.muted` (6:1 on the map's park fill, where `text.subtle` was
 * 4.1:1). The visible ring on keyboard focus goes round the pill. In Windows
 * high contrast (forced colours) the fills are gone, so the chosen pin's pill
 * takes a thick `Highlight` border.
 */
function MapPin({
  task,
  selected,
  onSelect,
}: {
  task: ShowcaseTask
  selected: boolean
  /** `byKeyboard`: the click came from Enter or Space (a click has no pointer). */
  onSelect: (id: DemoTaskId, byKeyboard: boolean) => void
}) {
  const narrow = PIN_SPOTS.narrow[task.id]
  const wide = PIN_SPOTS.wide[task.id]
  return (
    <PinButton
      type="button"
      aria-label={task.pinLabel}
      aria-current={selected ? 'true' : undefined}
      onClick={(event) => onSelect(task.id, event.detail === 0)}
      position="absolute"
      left={{ base: `${narrow.x * 100}%`, md: `${wide.x * 100}%` }}
      top={{ base: `${narrow.y * 100}%`, md: `${wide.y * 100}%` }}
      transform="translate(-50%, -100%)"
      zIndex={selected ? 2 : 1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="4px"
      p={0}
      bg="transparent"
      cursor="pointer"
      // A 44px-tall target: the pill (30) and its dot (10) plus the gap.
      minW="44px"
      outline="none"
      css={{
        touchAction: 'manipulation',
        '&:focus-visible [data-pin-pill]': sdlFocusRing,
        '&:not([aria-current="true"]):hover [data-pin-pill]': {
          borderColor: 'border.hover',
          boxShadow: sdlElevation.e2,
        },
        // The fills and the 6% scale are not drawn in forced colours: mark the
        // chosen pin with a thick border in the system highlight instead (the
        // focus ring is an outline, so both show).
        '@media (forced-colors: active)': {
          '&[aria-current="true"] [data-pin-pill]': {
            borderWidth: '3px',
            borderColor: 'Highlight',
          },
        },
      }}
    >
      <Box
        data-pin-pill=""
        display="flex"
        alignItems="center"
        h="30px"
        px={3}
        borderRadius="full"
        borderWidth="1px"
        borderColor={selected ? 'action.primary' : 'border.default'}
        bg={selected ? 'action.primary' : 'bg.surface'}
        color={selected ? 'text.onGreen' : 'status.success.fg'}
        fontSize="15px"
        lineHeight="1"
        {...sdlFigure}
        boxShadow={selected ? sdlElevation.e3 : sdlElevation.e1}
        transform={selected ? 'scale(1.06)' : 'none'}
        transformOrigin="50% 100%"
        transitionProperty="transform, box-shadow, background-color, border-color"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        css={{
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        {task.price}
      </Box>
      <Box
        aria-hidden
        boxSize={selected ? '12px' : '10px'}
        borderRadius="full"
        bg={selected ? 'action.primary' : 'border.hover'}
        boxShadow={`0 0 0 2px ${color('bg-surface')}`}
      />
      <Text
        as="span"
        aria-hidden
        position="absolute"
        top="100%"
        left="50%"
        transform="translateX(-50%)"
        mt="2px"
        whiteSpace="nowrap"
        fontSize="12px"
        lineHeight="16px"
        fontWeight={500}
        letterSpacing="0.06em"
        textTransform="uppercase"
        color="text.muted"
        textShadow="0 0 3px {colors.bg.subtle}, 0 0 6px {colors.bg.subtle}"
        pointerEvents="none"
      >
        {task.area}
      </Text>
    </PinButton>
  )
}

/**
 * The selected task's demo card, styled like the product's task card
 * (`TaskCard`): a 12px card with a hairline and `e1`, a neutral tile, a neutral
 * tag, the title at 500 and tight tracking, the price in ink at 600 with
 * tabular figures, and muted meta. The product's `TaskCard` reads the API and
 * the router, so this is a lightweight replica fed from the demo bag.
 */
function ShowcaseCard({
  task,
  animate,
}: {
  task: ShowcaseTask
  animate: boolean
}) {
  const Icon = TASK_ICONS[task.id]
  return (
    <Card
      p={3}
      maxW="full"
      data-showcase-card={task.id}
      // Swapping the card fades it in with an 8px rise, once the visitor has
      // picked a pin (not on first paint); reduced motion turns it off.
      {...(animate
        ? {
            animationName: 'fade-rise',
            animationDuration: sdlMotion.duration.slow,
            animationTimingFunction: sdlMotion.easing.decelerate,
            animationFillMode: 'backwards',
            css: {
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            },
          }
        : {})}
    >
      <HStack gap={3.5} align="center">
        <Box
          aria-hidden
          boxSize="56px"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          bg="bg.subtle"
          color="text.muted"
        >
          <Icon size={24} />
        </Box>
        <Stack flex={1} minW={0} gap={1.5} align="flex-start">
          <Badge variant="neutral" shape="pill">
            <LuMapPin size={12} aria-hidden />
            {task.area}
          </Badge>
          <Text
            fontSize="md"
            fontWeight={500}
            letterSpacing="-0.01em"
            lineHeight={1.3}
            color="text.default"
            lineClamp={2}
          >
            {task.title}
          </Text>
          <HStack gap={1} fontSize="sm" lineHeight={1.25}>
            <Text fontSize="sm" {...sdlFigure} color="text.default">
              {task.price}
            </Text>
            <Box
              as="span"
              aria-hidden
              css={{ color: color('text-muted'), fontSize: '12px' }}
            >
              ·
            </Box>
            <Text fontSize="sm" fontWeight={500} color="text.muted">
              {task.quotes}
            </Text>
          </HStack>
        </Stack>
      </HStack>
    </Card>
  )
}

/**
 * The interactive map panel (tone refresh, train 2, item 2): a full-width
 * panel on `bg.canvas` between two section rules, with a drawn monochrome map
 * of the demo tasks. The map runs edge to edge across the page column, between
 * the frame's rails and the rules (no inset, no radius, no band of padding
 * round it), as in the approved sketch. Each task is a price pin and each pin
 * is a labelled button (click, tap or keyboard): choosing one selects it, in
 * green 400 with an ink price, and shows its demo task card. Not a real map:
 * no tiles, no network, no new copy (the demo data is `landing.phone`).
 *
 * The card floats over the map's bottom-left corner from `md` and sits under
 * the map below it, on the page's gutters. The panel works from a 390px phone
 * to a 1920px screen (the map is as wide as the page column, 80rem, and keeps
 * its aspect ratio), and nothing moves under reduced motion but the card swap,
 * which then cuts. A pin chosen from the keyboard brings the card into view,
 * because on a laptop-height screen the card can be below the fold.
 */
export function MapShowcase({ copy }: { copy: PhoneCopy }) {
  const headingId = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  const tasks = buildShowcaseTasks(copy)
  const [selectedId, setSelectedId] = useState<DemoTaskId>(
    DEFAULT_SHOWCASE_TASK,
  )
  const [picked, setPicked] = useState(false)
  const selected = pickShowcaseTask(tasks, selectedId)

  const select = (id: DemoTaskId, byKeyboard: boolean) => {
    setSelectedId(id)
    setPicked(true)
    if (!byKeyboard) return
    // The card is where the choice shows up: keep it on screen (just far
    // enough, clear of the sticky header), without sliding under reduced motion.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    cardRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: calm ? 'auto' : 'smooth',
    })
  }

  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      data-map-showcase=""
      bg="bg.canvas"
    >
      <Container maxW={PAGE_CONTAINER_MAX_W} px={0}>
        <Reveal>
          <Box position="relative">
            <Box
              position="relative"
              overflow="hidden"
              // Under the map on a phone the card sits on the band: a hairline
              // closes the map. From md the card floats over it and the rule
              // below the section closes it.
              borderBottomWidth={{ base: '1px', md: 0 }}
              borderColor="border.default"
              bg="bg.subtle"
              aspectRatio={{
                base: '9 / 10',
                sm: '3 / 2',
                md: '9 / 5',
                lg: '11 / 5',
              }}
            >
              <MapArt />
              <Box
                position="absolute"
                top={4}
                left={4}
                zIndex={3}
                display="flex"
                alignItems="center"
                h="36px"
                px={3}
                gap={2}
                css={sdlOverlaySurface}
                borderRadius="full"
                color="text.default"
              >
                <Box as="span" display="inline-flex" color="text.muted">
                  <LuMapPin size={16} aria-hidden />
                </Box>
                <Heading as="h2" id={headingId} textStyle="label-md">
                  {copy.search.workerPlaceholder}
                </Heading>
              </Box>
              {tasks.map((task) => (
                <MapPin
                  key={task.id}
                  task={task}
                  selected={task.id === selected.id}
                  onSelect={select}
                />
              ))}
            </Box>
            <Box
              ref={cardRef}
              aria-live="polite"
              position={{ base: 'static', md: 'absolute' }}
              left={{ md: `${CARD_INSET_PX}px` }}
              bottom={{ md: `${CARD_INSET_PX}px` }}
              w={{ base: 'full', md: `${CARD_WIDTH_PX}px` }}
              maxW="full"
              px={{ base: PAGE_GUTTER_X.base, md: 0 }}
              py={{ base: 4, md: 0 }}
              zIndex={3}
              // `scrollIntoView` keeps it clear of the sticky header (56 or
              // 64px) above and a little air below.
              scrollMarginTop={{ base: '72px', md: '80px' }}
              scrollMarginBottom="16px"
            >
              <ShowcaseCard
                key={selected.id}
                task={selected}
                animate={picked}
              />
            </Box>
          </Box>
        </Reveal>
      </Container>
    </Box>
  )
}
