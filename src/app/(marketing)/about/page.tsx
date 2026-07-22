import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Footer } from '@/ui/Footer/Footer'

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
      <Box py={{ base: 10, md: 14 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Stack gap={6}>
            <Heading size="xl">{copy.heading}</Heading>
            {copy.paragraphs.map((paragraph) => (
              <Text
                key={paragraph.slice(0, 32)}
                color="text.muted"
                lineHeight="tall"
                fontSize="md"
              >
                {paragraph}
              </Text>
            ))}
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
