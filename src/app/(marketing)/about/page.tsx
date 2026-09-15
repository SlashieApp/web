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
import { Card } from '@/ui/Card/Card'
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
        <Container position="relative" zIndex={1}>
          <Stack gap={{ base: 6, md: 7 }} maxW="3xl">
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
        <Container>
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
            maxW="3xl"
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
        <Container>
          <Stack gap={{ base: 12, md: 14 }} maxW="3xl">
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

      <Box as="section" bg="bg.subtle" py={{ base: 12, md: 16 }}>
        <Container>
          <Stack gap={{ base: 8, md: 10 }} maxW="4xl">
            <Stack gap={3} maxW="3xl">
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: '28px', md: '36px' }}
                letterSpacing="-0.02em"
              >
                {copy.buildHeading}
              </Heading>
              <Text color="text.muted" lineHeight="tall">
                {copy.buildBody}
              </Text>
            </Stack>
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
            >
              {copy.proof.map((item) => (
                <Card key={item.title} layout="section" heading={item.title}>
                  <Text fontSize="sm" color="text.muted" lineHeight="tall">
                    {item.body}
                  </Text>
                </Card>
              ))}
            </Grid>
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

      <Footer />
    </>
  )
}
