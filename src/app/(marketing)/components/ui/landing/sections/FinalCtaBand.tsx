import { Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

import { Magnetic } from '../Magnetic'
import { Reveal } from '../Reveal'

/**
 * The story's last beat: one line, two ways in. Transparent so the 3D
 * objects gather around it; both paths go through sign-up first.
 */
export function FinalCtaBand({
  copy,
  ctas,
  postTaskHref,
  becomeWorkerHref,
}: {
  copy: { heading: string; body: string }
  ctas: { postTask: string; becomeWorker: string }
  postTaskHref: string
  becomeWorkerHref: string
}) {
  return (
    <Container as="section" py={{ base: 20, md: 32 }}>
      <Reveal>
        <Stack align="center" textAlign="center" gap={6} maxW="40rem" mx="auto">
          <Stack gap={3}>
            <Heading
              as="h2"
              fontFamily="display"
              fontWeight={800}
              fontSize={{ base: '34px', md: '52px' }}
              lineHeight={1.08}
              letterSpacing="-0.025em"
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
                <NextLink href={postTaskHref}>{ctas.postTask}</NextLink>
              </Button>
            </Magnetic>
            <Button asChild size="lg" variant="secondary">
              <NextLink href={becomeWorkerHref}>{ctas.becomeWorker}</NextLink>
            </Button>
          </HStack>
        </Stack>
      </Reveal>
    </Container>
  )
}
