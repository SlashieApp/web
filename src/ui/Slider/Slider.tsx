'use client'

import { Slider as ChakraSlider } from '@chakra-ui/react'
import type { ComponentProps } from 'react'

type ChakraSliderRootProps = ComponentProps<typeof ChakraSlider.Root>

export type SliderProps = ChakraSliderRootProps & {
  trackBg?: string
  rangeBg?: string
  thumbBg?: string
  thumbBorderColor?: string
}

/** Reusable themed slider with built-in track/range/thumb styling. */
export function Slider({
  trackBg = 'cardDivider',
  rangeBg = 'primary.600',
  thumbBg = 'primary.600',
  thumbBorderColor = 'bg',
  ...props
}: SliderProps) {
  return (
    <ChakraSlider.Root {...props} cursor="pointer">
      <ChakraSlider.Control>
        <ChakraSlider.Track bg={trackBg}>
          <ChakraSlider.Range bg={rangeBg} />
        </ChakraSlider.Track>
        <ChakraSlider.Thumbs
          bg={thumbBg}
          borderWidth="2px"
          borderColor={thumbBorderColor}
          boxShadow="none"
        />
      </ChakraSlider.Control>
    </ChakraSlider.Root>
  )
}
