'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Text, type TextProps } from '@chakra-ui/react'
import bag from '../i11n.json'

import { Button } from '../../Button'
import { Link } from '../../Link'

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
  const t = useI11n(bag)

  return (
    <HStack
      gap={2}
      align="center"
      flexShrink={0}
      display={{ base: 'none', sm: 'flex' }}
    >
      <Button asChild size="sm" variant="ghost" px={2}>
        <Link href={loginHref} _hover={{ textDecoration: 'none' }}>
          {t.logIn}
        </Link>
      </Button>
      <Button asChild size="sm" variant="primary">
        <Link href={signupHref} _hover={{ textDecoration: 'none' }}>
          {t.signUp}
        </Link>
      </Button>
    </HStack>
  )
}
