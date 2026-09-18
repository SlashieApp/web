'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { useId } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'

import bag from './i11n.json'

export type StarRatingInputProps = {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const t = useI11n(bag)
  const groupName = useId()

  return (
    <HStack gap={1} flexWrap="wrap">
      {[1, 2, 3, 4, 5].map((position) => {
        const selected = value === position
        const filled = (value ?? 0) >= position
        return (
          <Box
            key={position}
            as="label"
            position="relative"
            minW="44px"
            minH="44px"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            color={filled ? 'action.primary' : 'border.strong'}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            bg={selected ? 'status.success.soft' : 'transparent'}
            transitionProperty="color, background-color"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
            _hover={
              disabled
                ? undefined
                : { bg: 'status.success.soft', color: 'action.primary' }
            }
            _focusWithin={sdlFocusRing}
          >
            <input
              type="radio"
              name={groupName}
              value={position}
              checked={selected}
              disabled={disabled}
              aria-label={formatMessage(t.ratingStarAria, { count: position })}
              onChange={() => onChange(position)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                margin: 0,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            />
            <Text as="span" fontSize="xl" lineHeight="1" aria-hidden>
              ★
            </Text>
          </Box>
        )
      })}
    </HStack>
  )
}
