'use client'

import {
  Heading,
  type HeadingProps,
  Stack,
  type StackProps,
  Text,
  type TextProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type FormHeaderProps = Omit<StackProps, 'title'> & {
  title: ReactNode
  /** The subtitle, 8 under the title. */
  description?: ReactNode
  /** Heading level of the title: `h1` for the form that is the page, `h2` inside a page with its own `h1`. */
  as?: 'h1' | 'h2' | 'h3'
  /** `center` for status pages (sent, expired, done). */
  align?: 'start' | 'center'
  titleProps?: HeadingProps
  descriptionProps?: TextProps
}

/**
 * SDL form header: the title and its subtitle `formSpace.titleToSubtitle` (8)
 * apart, then `formSpace.headerToBody` (24) to the first field or block.
 *
 * The header owns that 24 below it, so put it in a plain container (a card
 * body), not a stack with its own gap. Pass `mb={0}` when a parent spaces it.
 */
export function FormHeader({
  title,
  description,
  as = 'h1',
  align = 'start',
  titleProps,
  descriptionProps,
  ...props
}: FormHeaderProps) {
  return (
    <Stack
      gap="form.titleToSubtitle"
      mb="form.headerToBody"
      w="full"
      textAlign={align === 'center' ? 'center' : 'start'}
      {...props}
    >
      <Heading
        as={as}
        fontFamily="heading"
        fontSize={{ base: '2xl', lg: '3xl' }}
        fontWeight={500}
        lineHeight="1.2"
        letterSpacing={{ base: '-0.02em', lg: '-0.025em' }}
        color="text.default"
        {...titleProps}
      >
        {title}
      </Heading>
      {description ? (
        <Text
          color="text.muted"
          fontSize="md"
          lineHeight="1.55"
          {...descriptionProps}
        >
          {description}
        </Text>
      ) : null}
    </Stack>
  )
}
