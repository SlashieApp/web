'use client'

import { Box, type BoxProps, HStack, Text, chakra } from '@chakra-ui/react'
import {
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { sdlElevation } from '@/theme/styles'

/** Screens are authored at iPhone size and scaled to fit the frame. */
export const SCREEN_W = 375
export const SCREEN_H = 812
/** Bezel as a share of the frame width, so the frame keeps one aspect ratio. */
const BEZEL = 0.03
const INNER = 1 - BEZEL * 2
/** Frame height / width. */
export const PHONE_ASPECT = (INNER * SCREEN_H) / SCREEN_W + BEZEL * 2

/** The well an inline phone is cropped in: its height, and its gutter round the phone. */
export const PHONE_CROP_H = 340
/**
 * How much more of the screen a docked phone shows (`StoryRail`): room under
 * the compact layout's action for the phone to fade out at its foot.
 */
export const PHONE_DOCK_EXTRA = 32
const CROP_GUTTER = 16
/** The cropped phone is drawn at 1:1: its width at most, its bezel and its status bar. */
const CROP_PHONE_W = 326
const CROP_BEZEL = 10
const CROP_STATUS_H = 38
/**
 * How much of a cropped phone's screen the well shows under the status bar
 * (274px): the well less its two hairlines, the gutter, the bezel and the bar.
 * A compact screen keeps its action and every word above this line.
 */
export const PHONE_CROP_SCREEN_H =
  PHONE_CROP_H - 2 - CROP_GUTTER - CROP_BEZEL - CROP_STATUS_H

/**
 * A list that runs past the crop fades out over its last 56px instead of
 * being sliced. `top` is where the masked box starts, in px from the top of
 * the screen.
 */
export function phoneCropFade(top = 0) {
  const end = PHONE_CROP_SCREEN_H - top
  const mask = `linear-gradient(to bottom, #000 ${end - 56}px, transparent ${end}px)`
  return { maskImage: mask, WebkitMaskImage: mask }
}

const Figure = chakra('figure')

/** Reduced motion turns off every transition and animation inside a phone. */
const STILL_UNDER_REDUCED_MOTION = {
  '@media (prefers-reduced-motion: reduce)': {
    '& *': {
      transitionDuration: '0ms !important',
      animationDuration: '0ms !important',
      animationIterationCount: '1 !important',
    },
  },
} as const

// useLayoutEffect warns during SSR; the scale is a client-only measurement.
const useIsoLayoutEffect =
  typeof window === 'undefined' ? () => {} : useLayoutEffect

/**
 * The status bar. `compact` is the cropped phone's: drawn at 1:1, so a step
 * smaller than the one the scaled frame shrinks (the time is 13px there), with
 * an island that follows the screen's width.
 */
function StatusBar({ compact = false }: { compact?: boolean }) {
  const icon = compact ? 0.8 : 1
  return (
    <HStack
      h={compact ? `${CROP_STATUS_H}px` : '47px'}
      px={compact ? '18px' : '28px'}
      justify="space-between"
      align="center"
      position="relative"
      zIndex={3}
      flexShrink={0}
      color="text.default"
      aria-hidden
    >
      <Text
        fontSize={compact ? '13px' : '16px'}
        fontWeight={600}
        fontVariantNumeric="tabular-nums"
        letterSpacing="-0.01em"
      >
        9:41
      </Text>
      <Box
        position="absolute"
        top={compact ? '7px' : '11px'}
        left="50%"
        transform="translateX(-50%)"
        w={compact ? '30%' : '122px'}
        h={compact ? '26px' : '35px'}
        borderRadius="full"
        bg="bg.inverted"
      />
      <HStack gap={compact ? '5px' : '6px'}>
        <svg
          width={18 * icon}
          height={12 * icon}
          viewBox="0 0 18 12"
          fill="currentColor"
        >
          <title>Signal</title>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg
          width={16 * icon}
          height={12 * icon}
          viewBox="0 0 16 12"
          fill="currentColor"
        >
          <title>Wi-Fi</title>
          <path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.3-1.4A10.3 10.3 0 0 0 8 .5 10.3 10.3 0 0 0 .7 3.5L2 4.9a8.3 8.3 0 0 1 6-2.4Zm0 3.6c1.4 0 2.6.5 3.6 1.4l1.3-1.4A7.2 7.2 0 0 0 8 4.1 7.2 7.2 0 0 0 3.1 6.1l1.3 1.4c1-.9 2.2-1.4 3.6-1.4Zm0 3.6c.5 0 1 .2 1.3.5L8 11.6 6.7 10.2c.3-.3.8-.5 1.3-.5Z" />
        </svg>
        <svg
          width={26 * icon}
          height={12 * icon}
          viewBox="0 0 26 12"
          fill="none"
        >
          <title>Battery</title>
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="3"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect
            x="2"
            y="2"
            width="18"
            height="8"
            rx="1.8"
            fill="currentColor"
          />
          <rect
            x="24"
            y="4"
            width="1.6"
            height="4"
            rx="0.8"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </HStack>
    </HStack>
  )
}

export type PhoneFrameProps = Omit<BoxProps, 'children'> & {
  /** Accessible name for the demo (the phone is a figure). */
  label: string
  /** Width the server renders at, before the client measures. */
  nominalWidth: number
  children: ReactNode
}

/**
 * Device chrome around a 375 x 812 screen, scaled to whatever width the
 * frame is given. Reduced motion turns off every transition inside.
 */
export function PhoneFrame({
  label,
  nominalWidth,
  children,
  ...boxProps
}: PhoneFrameProps) {
  const ref = useRef<HTMLElement>(null)
  const [width, setWidth] = useState(nominalWidth)
  const scale = (width * INNER) / SCREEN_W

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      if (el.offsetWidth > 0) setWidth(el.offsetWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Figure
      ref={ref}
      aria-label={label}
      m={0}
      position="relative"
      flexShrink={0}
      aspectRatio={`1 / ${PHONE_ASPECT}`}
      borderRadius="16%/7.6%"
      bg="bg.inverted"
      // Padding % would follow the parent's width, so size the bezel in px.
      p={`${width * BEZEL}px`}
      boxShadow={sdlElevation.e5}
      css={STILL_UNDER_REDUCED_MOTION}
      {...boxProps}
    >
      <Box
        position="relative"
        w="full"
        h="full"
        borderRadius="13%/6%"
        overflow="hidden"
        bg="bg.canvas"
        isolation="isolate"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          w={`${SCREEN_W}px`}
          h={`${SCREEN_H}px`}
          transformOrigin="top left"
          display="flex"
          flexDirection="column"
          style={{ transform: `scale(${scale})` }}
        >
          <StatusBar />
          <Box position="relative" flex={1} minH={0}>
            {children}
          </Box>
          <Box
            position="absolute"
            bottom="8px"
            left="50%"
            transform="translateX(-50%)"
            w="134px"
            h="5px"
            borderRadius="full"
            bg="text.default"
            zIndex={5}
            pointerEvents="none"
            aria-hidden
          />
        </Box>
      </Box>
    </Figure>
  )
}

/**
 * The inline phone below `lg`: the top of a phone in a well, the bento's
 * figure (canvas ground, a hairline, 16px corners). The phone is drawn at 1:1
 * (no scale), so its text is the size it is written at; it sits a gutter from
 * the well's top and sides and runs off the bottom, where only filler is cut.
 * Its screen is `PHONE_CROP_SCREEN_H` tall in the well: a screen's `compact`
 * layout fits that. Reduced motion turns off every transition inside.
 */
export function PhoneCrop({
  label,
  children,
  ref,
  docked = false,
  ...boxProps
}: Omit<PhoneFrameProps, 'nominalWidth'> & {
  ref?: Ref<HTMLElement>
  /**
   * The sideways story's phone (`StoryRail`): no well, the phone stands on the
   * page and runs off the screen's foot. Shorter screens crop more of it.
   */
  docked?: boolean
}) {
  return (
    <Figure
      ref={ref}
      aria-label={label}
      m={0}
      display="flex"
      justifyContent="center"
      h={`${PHONE_CROP_H}px`}
      pt={`${CROP_GUTTER}px`}
      px={`${CROP_GUTTER}px`}
      overflow="hidden"
      bg={docked ? 'transparent' : 'bg.canvas'}
      borderWidth={docked ? 0 : '1px'}
      borderColor="border.default"
      borderRadius={docked ? 0 : 'xl'}
      css={STILL_UNDER_REDUCED_MOTION}
      {...boxProps}
    >
      <Box
        data-phone-crop=""
        flexShrink={0}
        w="full"
        maxW={`${CROP_PHONE_W}px`}
        // Taller than the well, so the phone's foot is never in it (a docked
        // phone's well can be taller than an inline one's).
        h={`${docked ? PHONE_CROP_H + PHONE_DOCK_EXTRA : PHONE_CROP_H}px`}
        pt={`${CROP_BEZEL}px`}
        px={`${CROP_BEZEL}px`}
        borderTopRadius="46px"
        bg="bg.inverted"
        boxShadow={sdlElevation.e5}
      >
        <Box
          position="relative"
          h="full"
          display="flex"
          flexDirection="column"
          borderTopRadius="36px"
          overflow="hidden"
          bg="bg.canvas"
          isolation="isolate"
        >
          <StatusBar compact />
          <Box position="relative" flex={1} minH={0}>
            {children}
          </Box>
        </Box>
      </Box>
    </Figure>
  )
}
