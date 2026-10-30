'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { useId } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  formSpace,
  hitAreaGrowth,
  minHitArea,
  sdlFocusRing,
  sdlMotion,
} from '@/theme/styles'

import { useFormFieldControlProps } from '../FormField/formFieldContext'
import bag from './i11n.json'

export type StarRatingInputProps = {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
  /** Names the group (a rating has no native label to point at). */
  'aria-label'?: string
  /** The id of the element that names the group. */
  'aria-labelledby'?: string
}

/**
 * The visible star tile (px): the edges a gap is measured from. A rating is not
 * a text field, so it does not take the 48 of one; its tap target is the house
 * 44 (`minHitArea`), which reaches past the tile into the gaps around it.
 */
export const STAR_TILE = 32

/** Space between two tiles (px): the 44 targets reach 6 into it from each side, leaving 4 between them. */
const TILE_GAP = 16

/**
 * Five-star rating: a radio group of tiles.
 *
 * Form spacing (FE-481): the tile is {@link STAR_TILE} (32) and the 44px target
 * grows into the gaps, so the label is `labelToControl` (8) above the tile and
 * the helper or error `controlToHelper` (4) below it, measured from the tile's
 * edges, not the target's. The target reaches 8 up (to the label), 4 down (to
 * the helper) and 6 to each side (into the space between tiles).
 *
 * In a `FormField` the group carries the field's description and invalid state;
 * `aria-label` or `aria-labelledby` names it (the field's label cannot: it
 * points at a control, and a radio group is not one).
 */
export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: StarRatingInputProps) {
  const t = useI11n(bag)
  const groupName = useId()
  const control = useFormFieldControlProps({ disabled: disabled || undefined })
  const isDisabled = control.disabled
  const vertical = hitAreaGrowth(STAR_TILE, formSpace.labelToControl)
  const side = (minHitArea - STAR_TILE) / 2

  return (
    <HStack
      id={control.id}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={control['aria-describedby']}
      aria-invalid={control['aria-invalid']}
      aria-required={control.required || undefined}
      gap={`${TILE_GAP}px`}
      flexWrap="wrap"
    >
      {[1, 2, 3, 4, 5].map((position) => {
        const selected = value === position
        const filled = (value ?? 0) >= position
        return (
          <Box
            key={position}
            as="label"
            className="group"
            position="relative"
            display="inline-flex"
            cursor={isDisabled ? 'not-allowed' : 'pointer'}
            // The 44px target: padding that reaches past the tile, and the
            // margin that takes it back, so the tile is all the layout sees.
            {...vertical}
            px={`${side}px`}
            mx={`${-side}px`}
          >
            <input
              type="radio"
              name={groupName}
              value={position}
              checked={selected}
              disabled={isDisabled}
              aria-label={formatMessage(t.ratingStarAria, { count: position })}
              onChange={() => onChange(position)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                margin: 0,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            />
            <Box
              as="span"
              data-star-tile=""
              boxSize={`${STAR_TILE}px`}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              color={filled ? 'action.primary' : 'border.strong'}
              bg={selected ? 'status.success.soft' : 'transparent'}
              transitionProperty="color, background-color"
              transitionDuration={sdlMotion.duration.moderate}
              transitionTimingFunction={sdlMotion.easing.standard}
              _groupHover={
                isDisabled
                  ? undefined
                  : { bg: 'bg.subtle', color: 'action.primary' }
              }
              _groupFocusWithin={sdlFocusRing}
            >
              <Text as="span" fontSize="xl" lineHeight="1" aria-hidden>
                ★
              </Text>
            </Box>
          </Box>
        )
      })}
    </HStack>
  )
}
