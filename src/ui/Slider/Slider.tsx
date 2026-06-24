'use client'

import {
  Slider as ChakraSlider,
  type SystemStyleObject,
} from '@chakra-ui/react'
import type { ComponentProps } from 'react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

type ChakraSliderRootProps = ComponentProps<typeof ChakraSlider.Root>

/**
 * SDL Slider. Track/range/thumb reference SDL semantic roles only.
 *
 * GREEN-INK: the filled range uses `action.primary` (green). The thumb sits on
 * top of it and reads its own ring against `bg.surface`, so no ink/white pairing
 * is needed on the range itself (there is no text on the fill).
 *
 * The legacy override props (`trackBg`/`rangeBg`/`thumbBg`/`thumbBorderColor`)
 * are preserved for back-compat. They now default to SDL roles and still accept
 * any Chakra color token if a caller needs to override.
 */
export type UiSliderTone = 'primary' | 'danger'

export type SliderProps = ChakraSliderRootProps & {
  /** Semantic tone for the filled range + thumb. */
  tone?: UiSliderTone
  /** @deprecated Override the track (unfilled) color. Defaults to `border.default`. */
  trackBg?: string
  /** @deprecated Override the range (filled) color. Defaults to the tone fill. */
  rangeBg?: string
  /** @deprecated Override the thumb color. Defaults to the tone fill. */
  thumbBg?: string
  /** @deprecated Override the thumb ring color. Defaults to `bg.surface`. */
  thumbBorderColor?: string
}

const toneFill: Record<UiSliderTone, string> = {
  primary: 'action.primary',
  danger: 'status.danger.solid',
}

const thumbTransition: SystemStyleObject = {
  transitionProperty: 'transform, box-shadow',
  transitionDuration: sdlMotion.duration.fast,
  transitionTimingFunction: sdlMotion.easing.standard,
}

/** Reusable themed slider with built-in SDL track/range/thumb styling. */
export function Slider({
  tone = 'primary',
  trackBg = 'border.default',
  rangeBg,
  thumbBg,
  thumbBorderColor = 'bg.surface',
  ...props
}: SliderProps) {
  const fill = toneFill[tone]
  return (
    <ChakraSlider.Root {...props} cursor="pointer">
      <ChakraSlider.Control>
        <ChakraSlider.Track bg={trackBg}>
          <ChakraSlider.Range bg={rangeBg ?? fill} />
        </ChakraSlider.Track>
        <ChakraSlider.Thumbs
          bg={thumbBg ?? fill}
          borderWidth="2px"
          borderColor={thumbBorderColor}
          boxShadow="e1"
          outline="none"
          {...thumbTransition}
          _hover={{ transform: 'scale(1.06)' }}
          _focus={{ outline: 'none', boxShadow: 'e1' }}
          _focusVisible={{
            ...sdlFocusRing,
            transform: 'scale(1.08)',
          }}
          _disabled={{
            bg: 'border.strong',
            cursor: 'not-allowed',
          }}
        />
      </ChakraSlider.Control>
    </ChakraSlider.Root>
  )
}
