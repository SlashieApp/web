import { HStack, Text, type TextProps } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

export function HeaderToolbarSeparator(props: Omit<TextProps, 'children'>) {
  return (
    <Text
      display={{ base: 'none', sm: 'block' }}
      color="border.default"
      fontSize="sm"
      lineHeight={1}
      aria-hidden
      {...props}
    >
      |
    </Text>
  )
}

/**
 * Guest auth actions, styled to match the marketing header: ghost Log in +
 * green primary Sign up CTA. Rendered as single <a> elements via Button
 * asChild (a <button> inside an <a> is invalid HTML and double-focuses).
 */
export function HeaderGuestAuthButtons({
  loginHref,
  signupHref,
}: {
  loginHref: string
  signupHref: string
}) {
  return (
    <HStack
      gap={2}
      align="center"
      flexShrink={0}
      display={{ base: 'none', sm: 'flex' }}
    >
      <Button asChild size="sm" variant="ghost" px={2}>
        <NextLink href={loginHref}>Log in</NextLink>
      </Button>
      <Button asChild size="sm" variant="primary">
        <NextLink href={signupHref}>Sign up</NextLink>
      </Button>
    </HStack>
  )
}
