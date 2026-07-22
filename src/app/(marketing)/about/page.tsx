import { Box, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Footer } from '@/ui/Footer/Footer'
import { Link } from '@/ui/Link/Link'

import messages from './i11n.json'

const LINKEDIN_HREF = 'https://www.linkedin.com/company/slashie-app'
const GITHUB_HREF = 'https://github.com/SlashieApp/web'

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
      <Box py={{ base: 10, md: 14 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Stack gap={8}>
            <Stack gap={4}>
              <Heading size="xl">{copy.heading}</Heading>
              <Text color="text.muted" lineHeight="tall" fontSize="md">
                {copy.lead}
              </Text>
            </Stack>

            <Stack gap={3}>
              <Heading as="h2" size="md">
                {copy.productHeading}
              </Heading>
              <Text color="text.muted" lineHeight="tall" fontSize="md">
                {copy.productBody}
              </Text>
            </Stack>

            <Stack gap={3}>
              <Heading as="h2" size="md">
                {copy.buildHeading}
              </Heading>
              <Text color="text.muted" lineHeight="tall" fontSize="md">
                {copy.buildBody}
              </Text>
              <HStack gap={5} flexWrap="wrap" pt={1}>
                <Link
                  href={LINKEDIN_HREF}
                  tone="emphasis"
                  fontWeight={600}
                  fontSize="sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.connect.linkedin}
                </Link>
                <Link
                  href={GITHUB_HREF}
                  tone="emphasis"
                  fontWeight={600}
                  fontSize="sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.connect.github}
                </Link>
              </HStack>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
