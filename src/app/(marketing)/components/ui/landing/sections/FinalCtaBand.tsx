import { Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

import { Magnetic } from '../Magnetic'
import { Reveal } from '../Reveal'

type CtaLink = { label: string; href: string }

/**
 * A closing beat: one line, two ways in (primary, then secondary). Transparent
 * so the landing's 3D objects gather around it. Hrefs come localized.
 */
export function FinalCtaBand({
  copy,
  primary,
  secondary,
}: {
  copy: { heading: string; body: string }
  primary: CtaLink
  secondary: CtaLink
}) {
  return (
    <Container as="section" py={{ base: 20, md: 32 }}>
      <Reveal>
        <Stack align="center" textAlign="center" gap={6} maxW="40rem" mx="auto">
          <Stack gap={3}>
            <Heading
              as="h2"
              fontFamily="display"
              fontWeight={500}
              fontSize={{ base: '34px', md: '52px' }}
              lineHeight={1.08}
              letterSpacing="-0.035em"
            >
              {copy.heading}
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="text.muted"
              lineHeight="tall"
            >
              {copy.body}
            </Text>
          </Stack>
          <HStack gap={3} flexWrap="wrap" justify="center">
            <Magnetic>
              <Button asChild size="lg" variant="primary">
                <NextLink href={primary.href}>{primary.label}</NextLink>
              </Button>
            </Magnetic>
            <Button asChild size="lg" variant="secondary">
              <NextLink href={secondary.href}>{secondary.label}</NextLink>
            </Button>
          </HStack>
        </Stack>
      </Reveal>
    </Container>
  )
}
