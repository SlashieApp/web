import { Box, type BoxProps } from '@chakra-ui/react'

import { sdlElevation, sdlFigure, sdlMotion } from '@/theme/styles'

const color = (token: string) => `var(--chakra-colors-${token})`

const MAJOR_ROADS = [
  'M-10 120 C 80 140, 160 90, 240 130 S 330 170, 390 150',
  'M120 -10 C 130 120, 100 260, 150 400 S 190 640, 170 780',
  'M260 -10 C 250 140, 300 250, 280 380 S 250 600, 300 780',
  'M-10 560 C 90 540, 200 600, 280 560 S 360 520, 390 540',
  'M-10 300 C 60 320, 140 280, 220 310 S 330 340, 390 300',
]

const MINOR_ROADS = [
  'M40 -10 L 70 780',
  'M200 -10 C 190 200, 230 420, 210 780',
  'M330 -10 L 350 780',
  'M-10 220 L 390 240',
  'M-10 470 C 120 480, 250 450, 390 470',
  'M-10 680 L 390 650',
  'M60 360 L 330 210',
  'M30 620 L 300 420',
]

const PARKS: { x: number; y: number; w: number; h: number; r: number }[] = [
  { x: 176, y: 40, w: 74, h: 58, r: 22 },
  { x: 24, y: 330, w: 92, h: 58, r: 18 },
  { x: 110, y: 486, w: 66, h: 42, r: 16 },
  { x: 228, y: 600, w: 86, h: 62, r: 24 },
]

const LABELS: { x: number; y: number; text: string }[] = [
  { x: 214, y: 112, text: 'CAMDEN' },
  { x: 300, y: 190, text: 'ISLINGTON' },
  { x: 44, y: 410, text: 'KENSINGTON' },
  { x: 196, y: 375, text: 'WESTMINSTER' },
  { x: 40, y: 540, text: 'FULHAM' },
  { x: 318, y: 520, text: 'BRIXTON' },
  { x: 270, y: 690, text: 'CLAPHAM' },
]

/**
 * A hand-drawn London-ish street map behind the demo map screens: a
 * monochrome sketch in neutral tokens only (land
 * `bg.subtle`, parks `border.default`, the river `border.strong`, streets
 * `bg.surface`, wide roads with a hairline casing). No green, no mint.
 *
 * `viewBox` shows a part of the 375 x 765 map instead of all of it (the post
 * screen centres its pin on Clapham with it). `labels` false leaves the place
 * names out: the cropped phone draws the map at 1:1, where they would be
 * under the 11px floor.
 */
export function PhoneMap({
  viewBox = '0 0 375 765',
  labels = true,
  ...props
}: BoxProps & { viewBox?: string; labels?: boolean }) {
  return (
    <Box position="absolute" inset={0} overflow="hidden" {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <title>Map</title>
        <rect width="375" height="765" fill={color('bg-subtle')} />
        {PARKS.map((park) => (
          <rect
            key={`${park.x}-${park.y}`}
            x={park.x}
            y={park.y}
            width={park.w}
            height={park.h}
            rx={park.r}
            fill={color('border-default')}
          />
        ))}
        <path
          d="M-10 430 C 60 400, 110 470, 170 450 S 260 380, 300 420 S 360 470, 390 440"
          fill="none"
          stroke={color('border-strong')}
          strokeOpacity={0.75}
          strokeWidth={24}
          strokeLinecap="round"
        />
        {MINOR_ROADS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={color('bg-surface')}
            strokeWidth={3}
          />
        ))}
        {MAJOR_ROADS.map((d) => (
          <path
            key={`casing-${d}`}
            d={d}
            fill="none"
            stroke={color('border-default')}
            strokeWidth={10}
            strokeLinecap="round"
          />
        ))}
        {MAJOR_ROADS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={color('bg-surface')}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ))}
        {labels
          ? LABELS.map((label) => (
              <text
                key={label.text}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                letterSpacing="1.4"
                fill={color('text-subtle')}
              >
                {label.text}
              </text>
            ))
          : null}
      </svg>
    </Box>
  )
}

/**
 * The app's price pin: a white pill with a 1px hairline, `e1` and the price in
 * green 800 at 600 with tabular figures, over a green dot. Selected, it is a
 * white card with a 2px green edge: the price, and how far the task is under
 * it. Decoration here, so it is not a button (the screen's tappable beat
 * wraps it in a `Hotspot`).
 */
export function PricePin({
  price,
  selected,
  caption,
}: {
  price: string
  selected: boolean
  /** Under the price of the selected pin: how far the task is, as the app's pin says it. */
  caption?: string
}) {
  const card = selected && caption
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="4px"
      pointerEvents="none"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="center"
        minH="30px"
        px="12px"
        py={card ? '6px' : 0}
        borderRadius={card ? '12px' : 'full'}
        borderWidth={selected ? '2px' : '1px'}
        borderColor={selected ? 'accent.active' : 'border.default'}
        bg="bg.surface"
        color="status.success.fg"
        boxShadow={selected ? sdlElevation.e3 : sdlElevation.e1}
        transformOrigin="50% 100%"
        transitionProperty="box-shadow, border-color"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
      >
        <Box fontSize={card ? '18px' : '16px'} lineHeight="1.1" {...sdlFigure}>
          {price}
        </Box>
        {card ? (
          <Box
            fontSize="11px"
            lineHeight="14px"
            fontWeight={500}
            color="text.muted"
            whiteSpace="nowrap"
          >
            {caption}
          </Box>
        ) : null}
      </Box>
      <Box
        w={selected ? '12px' : '10px'}
        h={selected ? '12px' : '10px'}
        borderRadius="full"
        bg="action.primary"
        boxShadow={`0 0 0 2px ${color('bg-surface')}`}
      />
    </Box>
  )
}
