import { HStack, Link, Text, type TextProps } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

const authButtonLinkProps = {
  _hover: { textDecoration: 'none' },
  flexShrink: 0,
} as const

export function HeaderToolbarSeparator(props: Omit<TextProps, 'children'>) {
  return (
    <Text
      display={{ base: 'none', sm: 'block' }}
      color="cardBorder"
      fontSize="sm"
      lineHeight={1}
      aria-hidden
      {...props}
    >
      |
    </Text>
  )
}

function HeaderAuthButton({
  href,
  children,
}: {
  href: string
  children: string
}) {
  return (
    <Link as={NextLink} href={href} {...authButtonLinkProps}>
      <Button size="sm" variant="ghost" px={2}>
        {children}
      </Button>
    </Link>
  )
}

export function HeaderGuestAuthButtons({
  loginHref,
  signupHref,
}: {
  loginHref: string
  signupHref: string
}) {
  return (
    <HStack
      gap={0}
      align="center"
      flexShrink={0}
      display={{ base: 'none', sm: 'flex' }}
    >
      <HeaderAuthButton href={loginHref}>Log in</HeaderAuthButton>
      <HeaderAuthButton href={signupHref}>Sign up</HeaderAuthButton>
    </HStack>
  )
}
