import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { LuCheck, LuGithub, LuLinkedin } from 'react-icons/lu'

import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Button } from '@/ui/Button/Button'
import { Footer } from '@/ui/Footer/Footer'
import { Link } from '@/ui/Link/Link'

import { Reveal } from '../components/landing/Reveal'
import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/about' })
}

export default async function AboutPage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return (
    <>
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bg="bg.canvas"
        pt={{ base: 12, md: 16 }}
        pb={{ base: 12, md: 16 }}
      >
        <Box
          position="absolute"
          inset={0}
          aria-hidden
          bgImage="radial-gradient(42rem 22rem at 12% -10%, rgba(0, 220, 130, 0.16) 0%, transparent 68%), radial-gradient(28rem 18rem at 92% 8%, rgba(0, 220, 130, 0.08) 0%, transparent 70%)"
        />
        <Container
          maxW="3xl"
          px={{ base: 4, md: 6 }}
          position="relative"
          zIndex={1}
        >
          <Stack gap={{ base: 6, md: 7 }}>
            <Stack gap={3}>
              <Text
                fontSize="xs"
                fontWeight={700}
                letterSpacing="0.14em"
                textTransform="uppercase"
                color="text.link"
              >
                {copy.eyebrow}
              </Text>
              <Heading
                as="h1"
                fontFamily="display"
                fontSize={{ base: '48px', md: '64px' }}
                letterSpacing="-0.04em"
                lineHeight="1"
                color="text.default"
              >
                {copy.brand}
              </Heading>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="text.default"
                fontWeight={500}
                lineHeight="tall"
                maxW="34rem"
              >
                {copy.heroSupport}
              </Text>
            </Stack>

            <HStack gap={3} flexWrap="wrap">
              <Button asChild size="md" variant="primary">
                <Link
                  href={SLASHIE_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecoration: 'none' }}
                >
                  <HStack gap={2}>
                    <LuLinkedin size={16} aria-hidden />
                    <span>{copy.connect.linkedin}</span>
                  </HStack>
                </Link>
              </Button>
              <Button asChild size="md" variant="secondary">
                <Link
                  href={SLASHIE_GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecoration: 'none' }}
                >
                  <HStack gap={2}>
                    <LuGithub size={16} aria-hidden />
                    <span>{copy.connect.github}</span>
                  </HStack>
                </Link>
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      <Box as="section" bg="status.success.soft" py={{ base: 8, md: 10 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
          >
            {copy.trustPoints.map((point) => (
              <HStack key={point} gap={3} align="flex-start">
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="22px"
                  borderRadius="full"
                  bg="action.primary"
                  color="text.onGreen"
                  flexShrink={0}
                  mt="1px"
                  aria-hidden
                >
                  <LuCheck size={12} strokeWidth={3} />
                </Box>
                <Text fontSize="sm" fontWeight={600} color="text.default">
                  {point}
                </Text>
              </HStack>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box as="section" py={{ base: 12, md: 16 }} bg="bg.canvas">
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 12, md: 14 }}>
            <Reveal>
              <Stack gap={4}>
                <Heading
                  as="h2"
                  fontFamily="display"
                  fontSize={{ base: '28px', md: '36px' }}
                  letterSpacing="-0.02em"
                >
                  {copy.missionHeading}
                </Heading>
                <Text
                  color="text.muted"
                  lineHeight="tall"
                  fontSize={{ base: 'md', md: 'lg' }}
                >
                  {copy.lead}
                </Text>
              </Stack>
            </Reveal>

            <Reveal delayMs={80}>
              <Stack gap={4}>
                <Heading
                  as="h2"
                  fontFamily="display"
                  fontSize={{ base: '28px', md: '36px' }}
                  letterSpacing="-0.02em"
                >
                  {copy.productHeading}
                </Heading>
                <Text
                  color="text.muted"
                  lineHeight="tall"
                  fontSize={{ base: 'md', md: 'lg' }}
                >
                  {copy.productBody}
                </Text>
              </Stack>
            </Reveal>
          </Stack>
        </Container>
      </Box>

      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bg="bg.inverted"
        py={{ base: 12, md: 16 }}
      >
        <Box
          position="absolute"
          inset={0}
          aria-hidden
          bgImage="radial-gradient(34rem 16rem at 78% 120%, rgba(0, 220, 130, 0.16) 0%, transparent 70%)"
        />
        <Container
          maxW="3xl"
          px={{ base: 4, md: 6 }}
          position="relative"
          zIndex={1}
        >
          <Reveal>
            <Stack gap={5}>
              <Stack gap={3}>
                <Heading
                  as="h2"
                  fontFamily="display"
                  fontSize={{ base: '28px', md: '36px' }}
                  letterSpacing="-0.02em"
                  color="text.onInverted"
                >
                  {copy.buildHeading}
                </Heading>
                <Text color="text.onInvertedMuted" lineHeight="tall">
                  {copy.buildBody}
                </Text>
              </Stack>
              <HStack gap={3} flexWrap="wrap">
                <Button asChild size="md" variant="primary">
                  <Link
                    href={SLASHIE_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: 'none' }}
                  >
                    <HStack gap={2}>
                      <LuLinkedin size={16} aria-hidden />
                      <span>{copy.connect.linkedin}</span>
                    </HStack>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="md"
                  variant="ghost"
                  color="text.onInverted"
                  borderWidth="1px"
                  borderColor="border.glass"
                  _hover={{ bg: 'bg.glass', color: 'text.onInverted' }}
                  _active={{ bg: 'bg.glass', color: 'text.onInverted' }}
                >
                  <Link
                    href={SLASHIE_GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: 'none' }}
                  >
                    <HStack gap={2}>
                      <LuGithub size={16} aria-hidden />
                      <span>{copy.connect.github}</span>
                    </HStack>
                  </Link>
                </Button>
              </HStack>
            </Stack>
          </Reveal>
        </Container>
      </Box>

      <Footer />
    </>
  )
}
