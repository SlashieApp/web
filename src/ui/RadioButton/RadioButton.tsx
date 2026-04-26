'use client'

import { Box, type BoxProps, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type RadioButtonProps = Omit<BoxProps, 'onChange' | 'children'> & {
  checked: boolean
  label: ReactNode
  onChange?: () => void
}

/** Reusable radio-style button row with built-in indicator dot. */
export function RadioButton({
  checked,
  label,
  onChange,
  borderRadius = 'lg',
  ...rest
}: RadioButtonProps) {
  return (
    <Box
      as="button"
      cursor="pointer"
      pointerEvents="auto"
      onClick={() => onChange?.()}
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      w="full"
      minH={11}
      px={3}
      py={2.5}
      borderWidth="1px"
      borderRadius={borderRadius}
      borderColor={checked ? 'intentPrimaryBorder' : 'cardBorder'}
      bg={checked ? 'intentPrimaryBg' : 'transparent'}
      color={checked ? 'intentPrimaryFg' : 'formLabelMuted'}
      _hover={{ bg: checked ? 'intentPrimaryBg' : 'badgeBg' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'primary.500',
        outlineOffset: '2px',
      }}
      {...rest}
    >
      <Box
        as="span"
        w={4}
        h={4}
        borderRadius="full"
        borderWidth="2px"
        borderColor={checked ? 'intentPrimaryBorder' : 'formControlBorder'}
        mr={2.5}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {checked ? (
          <Box as="span" w={2} h={2} borderRadius="full" bg="intentPrimaryFg" />
        ) : null}
      </Box>
      <Text fontSize="sm" fontWeight={600} textAlign="left">
        {label}
      </Text>
    </Box>
  )
}
