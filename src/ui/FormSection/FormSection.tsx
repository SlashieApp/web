'use client'

import { Box, type BoxProps, Heading } from '@chakra-ui/react'
import { type ReactNode, useId } from 'react'

import { FormStack } from '../FormStack/FormStack'

export type FormSectionProps = Omit<BoxProps, 'title'> & {
  title: ReactNode
  /** Heading level of the title. Default `h2`. */
  as?: 'h2' | 'h3'
  children: ReactNode
}

/**
 * SDL form section, for a long form: a section title, then its fields
 * `formSpace.sectionTitleToField` (12) below it and `fieldGap` (20) apart.
 * Put the sections in `<FormStack gap="section">` so they sit 32 apart. There
 * is no dividing line between sections.
 */
export function FormSection({
  title,
  as = 'h2',
  children,
  ...props
}: FormSectionProps) {
  const titleId = useId()
  return (
    <Box as="section" aria-labelledby={titleId} w="full" {...props}>
      <Heading
        as={as}
        id={titleId}
        textStyle="heading-sm"
        color="text.default"
        mb="form.sectionTitleToField"
      >
        {title}
      </Heading>
      <FormStack>{children}</FormStack>
    </Box>
  )
}
