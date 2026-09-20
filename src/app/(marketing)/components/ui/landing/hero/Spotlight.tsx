'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

type SpotlightProps = {
  /** Positioning / sizing overrides for the SVG cone. */
  rootProps?: BoxProps
  /** Spotlight fill. Soft white reads as depth on the ink hero. */
  fill?: string
}

/**
 * ReactBits / Aceternity-style spotlight: a soft elliptical cone that drifts
 * over the dark hero surface. Decorative only — pointer-events none.
 */
export function Spotlight({ fill = 'white', rootProps }: SpotlightProps) {
  return (
    <Box
      position="absolute"
      pointerEvents="none"
      aria-hidden
      zIndex={0}
      top={{ base: '-8rem', md: '-10rem' }}
      left={{ base: '-2rem', md: '20%' }}
      w={{ base: '140%', md: '80%' }}
      maxW="56rem"
      opacity={{ base: 0.35, md: 0.55 }}
      css={{
        animation: 'hero-spotlight-drift 14s ease-in-out infinite alternate',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
        '@keyframes hero-spotlight-drift': {
          from: { transform: 'translate3d(0, 0, 0) rotate(-12deg)' },
          to: { transform: 'translate3d(6%, 4%, 0) rotate(-8deg)' },
        },
      }}
      {...rootProps}
    >
      <Box
        as="svg"
        display="block"
        w="full"
        h="auto"
        // @ts-expect-error Chakra Box as=svg: viewBox is a valid svg attribute
        viewBox="0 0 3787 2842"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#hero-spotlight-blur)">
          <ellipse
            cx="1924.71"
            cy="273.501"
            rx="1924.71"
            ry="273.501"
            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.9 2291.2)"
            fill={fill}
            fillOpacity="0.21"
          />
        </g>
        <defs>
          <filter
            id="hero-spotlight-blur"
            x="0.860352"
            y="0.838989"
            width="3785.16"
            height="2840.26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="151"
              result="effect1_foregroundBlur"
            />
          </filter>
        </defs>
      </Box>
    </Box>
  )
}
