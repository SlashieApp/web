import { Box, type BoxProps } from '@chakra-ui/react'

import { sdlElevation } from '@/theme/styles'

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

/** A hand-drawn London-ish street map behind the demo map screens. */
export function PhoneMap(props: BoxProps) {
  return (
    <Box position="absolute" inset={0} overflow="hidden" {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 375 765"
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
            fill={color('green-100')}
            opacity={0.85}
          />
        ))}
        <path
          d="M-10 430 C 60 400, 110 470, 170 450 S 260 380, 300 420 S 360 470, 390 440"
          fill="none"
          stroke={color('info-solid')}
          strokeOpacity={0.22}
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
            key={d}
            d={d}
            fill="none"
            stroke={color('bg-surface')}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ))}
        {LABELS.map((label) => (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            letterSpacing="1.4"
            fill={color('text-subtle')}
          >
            {label.text}
          </text>
        ))}
      </svg>
    </Box>
  )
}

/** The app's price pin: a white pill with green ink over a dot. */
export function PricePin({
  price,
  selected,
}: {
  price: string
  selected: boolean
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="4px"
      pointerEvents="none"
    >
      <Box
        px="10px"
        py="4px"
        borderRadius="10px"
        bg={selected ? 'action.primary' : 'bg.surface'}
        color={selected ? 'text.onGreen' : 'status.success.fg'}
        borderWidth="2px"
        borderColor={selected ? 'action.primary' : 'transparent'}
        fontSize="16px"
        fontWeight={800}
        lineHeight={1.2}
        boxShadow={selected ? sdlElevation.e3 : sdlElevation.e2}
        transform={selected ? 'scale(1.08)' : 'none'}
        transition="transform 220ms cubic-bezier(0.2, 0, 0, 1)"
      >
        {price}
      </Box>
      <Box
        w={selected ? '14px' : '11px'}
        h={selected ? '14px' : '11px'}
        borderRadius="full"
        bg={selected ? 'action.primary' : 'status.success.border'}
        boxShadow={`0 0 0 3px ${color('bg-surface')}`}
      />
    </Box>
  )
}
