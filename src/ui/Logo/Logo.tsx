'use client'

import { Box, Image, type ImageProps, chakra } from '@chakra-ui/react'
import type { ComponentProps, MouseEventHandler } from 'react'
import { useEffect, useState } from 'react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

import { useColorMode } from '../color-mode'

/**
 * SDL Logo (Foundations). Renders the Slashie wordmark or compact mark, picking the
 * correct artwork for the active colour mode. The component is presentational by
 * default — it is normally wrapped in a `Link` that owns focus. When made
 * interactive (`interactive`, or an `onClick`/`href` is supplied) it becomes
 * keyboard-focusable and shows the SDL visible focus ring via `sdlFocusRing`.
 *
 * The image artwork is brand-coloured PNG/SVG and is the one place where raw brand
 * green is permitted (per the SDL raw-consumer carve-out for image assets); no
 * design tokens or hex are used in this component's styling.
 */
export type UiLogoVariant =
  | 'wordmark'
  | 'mark'
  // legacy alias (migration): `mobile` boolean mapped onto the mark variant
  | 'mobile'

export type UiLogoSize = 'sm' | 'md' | 'lg'

export type LogoProps = Omit<ImageProps, 'src' | 'alt' | 'onClick'> & {
  /** Click handler. Supplying it auto-enables the interactive (button) mode. */
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Which artwork to render. `wordmark` (default) or the compact `mark`. */
  variant?: UiLogoVariant
  /** @deprecated Use `variant="mark"`. Kept as an alias during migration. */
  mobile?: boolean
  /** Named height preset. Ignored when `h`/`height` is passed explicitly. */
  size?: UiLogoSize
  /**
   * Render as an interactive, keyboard-focusable element with a visible focus
   * ring. Auto-enabled when `onClick` is supplied. Prefer wrapping in `Link` for
   * navigation; use this only when the Logo itself must be the control.
   */
  interactive?: boolean
  /** Accessible label. Defaults to "Slashie". */
  label?: string
  /** Merged onto the wrapper around the image (e.g. `display="block"`, `w="full"`). */
  containerProps?: Omit<ComponentProps<typeof Box>, 'children' | 'onClick'>
}

const InteractiveLogoButton = chakra('button')

type SdlLogoVariant = 'wordmark' | 'mark'

const variantAlias: Record<UiLogoVariant, SdlLogoVariant> = {
  wordmark: 'wordmark',
  mark: 'mark',
  mobile: 'mark',
}

/** Heights are responsive; presets keep the wordmark legible across breakpoints. */
const logoSizes: Record<UiLogoSize, ImageProps['h']> = {
  sm: { base: '20px', md: '24px' },
  md: { base: '24px', md: '32px' },
  lg: { base: '32px', md: '40px' },
}

export function Logo({
  variant,
  mobile = false,
  size = 'md',
  interactive,
  label = 'Slashie',
  containerProps,
  onClick,
  h,
  height,
  ...props
}: LogoProps) {
  const [mounted, setMounted] = useState(false)
  const { colorMode } = useColorMode()

  const resolvedVariant =
    variantAlias[variant ?? (mobile ? 'mark' : 'wordmark')]
  const isMark = resolvedVariant === 'mark'
  const isInteractive = interactive ?? Boolean(onClick)

  const logoSrc = isMark
    ? '/images/slashie-logo-mobile.png'
    : colorMode === 'light'
      ? '/images/slashie-logo-light.png'
      : '/images/slashie-logo-dark.png'

  // Mount-gate so the colour-mode-correct artwork is chosen client-side and we
  // avoid a hydration flash of the wrong (or duplicated) logo.
  useEffect(() => {
    setMounted(true)
  }, [])

  const image = mounted ? (
    <Image
      h={h ?? height ?? logoSizes[size]}
      w="auto"
      objectFit="contain"
      {...props}
      src={logoSrc}
      alt={label}
    />
  ) : null

  if (isInteractive) {
    return (
      <InteractiveLogoButton
        type="button"
        aria-label={label}
        cursor="pointer"
        bg="transparent"
        border="none"
        p={0}
        // 44px min touch target for the interactive logo control.
        minH="44px"
        minW="44px"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        lineHeight={0}
        borderRadius="md"
        onClick={onClick}
        transitionProperty="opacity, transform"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        _hover={{ opacity: 0.9 }}
        _active={{ transform: 'scale(0.98)' }}
        _focusVisible={sdlFocusRing}
        // containerProps is typed against the Box (div) wrapper; the button
        // branch shares the same styling surface, so cast away the element-
        // specific event-handler variance.
        {...(containerProps as ComponentProps<typeof InteractiveLogoButton>)}
      >
        {image}
      </InteractiveLogoButton>
    )
  }

  return (
    <Box
      as="span"
      display="inline-block"
      lineHeight={0}
      borderRadius="md"
      _focus={{ outline: 'none' }}
      _focusVisible={{ outline: 'none' }}
      {...containerProps}
    >
      {image}
    </Box>
  )
}
