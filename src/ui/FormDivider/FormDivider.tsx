'use client'

import { Box, HStack, type StackProps, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'

import bag from './i11n.json'

export type FormDividerProps = Omit<StackProps, 'children'> & {
  /** The label between the rules. Default: "Or continue with". */
  children?: ReactNode
}

/**
 * SDL form divider, "Or continue with": a rule, a label and a rule, with
 * `formSpace.actionToDivider` (24) above it (under the main button) and
 * `formSpace.dividerToAlternatives` (24) below it (above Google and Apple).
 *
 * The divider owns those two gaps, so put it in a plain container, not a stack
 * with its own gap. Hide it with the alternatives it introduces.
 */
export function FormDivider({ children, ...props }: FormDividerProps) {
  const t = useI11n(bag)
  return (
    <HStack
      gap={3}
      w="full"
      mt="form.actionToDivider"
      mb="form.dividerToAlternatives"
      {...props}
    >
      <Box flex={1} h="1px" bg="border.default" aria-hidden />
      <Text fontSize="xs" color="text.muted" flexShrink={0}>
        {children ?? t.label}
      </Text>
      <Box flex={1} h="1px" bg="border.default" aria-hidden />
    </HStack>
  )
}
