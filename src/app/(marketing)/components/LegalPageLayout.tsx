import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { LegalDocument } from '@/content/legal/types'
import { Link } from '@/ui'

const EMAIL_PATTERN = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi

/**
 * Renders plain policy copy, turning email addresses into mailto links so the
 * content files stay markup-free.
 */
function linkifyEmails(paragraph: string): ReactNode[] {
  let offset = 0
  return paragraph.split(EMAIL_PATTERN).map((part, index) => {
    // Key by character offset: unique and stable for static copy.
    const key = `${offset}`
    offset += part.length
    // Odd indexes are the captured email matches; even parts are plain text
    // (strings need no key).
    return index % 2 === 1 ? (
      <Link key={key} href={`mailto:${part}`}>
        {part}
      </Link>
    ) : (
      part
    )
  })
}

/**
 * Shared prose shell for the public legal pages (/terms, /privacy, /cookies).
 * Single readable column (~720px) built from SDL semantic roles only; copy
 * comes from `src/content/legal/*` so it can change without touching UI.
 */
export function LegalPageLayout({
  document,
}: {
  document: LegalDocument & { lastUpdatedLabel?: string }
}) {
  return (
    <Box py={{ base: 10, md: 14 }}>
      <Container maxW="45rem" px={{ base: 4, md: 6 }}>
        <Stack gap={8}>
          <Stack gap={2}>
            <Heading as="h1" size="xl">
              {document.title}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {document.lastUpdatedLabel ?? 'Last updated'}:{' '}
              {document.lastUpdated}
            </Text>
          </Stack>
          {document.intro?.map((paragraph) => (
            <Text
              key={paragraph.slice(0, 32)}
              color="text.default"
              lineHeight="tall"
            >
              {linkifyEmails(paragraph)}
            </Text>
          ))}
          {document.sections.map((section) => (
            <Stack key={section.heading} gap={3}>
              <Heading as="h2" size="md">
                {section.heading}
              </Heading>
              {section.body.map((paragraph) => (
                <Text
                  key={paragraph.slice(0, 32)}
                  color="text.muted"
                  lineHeight="tall"
                >
                  {linkifyEmails(paragraph)}
                </Text>
              ))}
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
