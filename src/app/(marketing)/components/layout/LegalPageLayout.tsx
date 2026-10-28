import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { LegalDocument } from '@/content/legal/types'
import { Link } from '@/ui'

import { MarketingPageHeader } from './MarketingPageHeader'

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
 * Shared prose shell for the public legal pages (/terms, /privacy, /cookies,
 * /help/safety). The page header (FE-458) with the title, then the policy in
 * an inner readable measure, left-aligned to the page `<Container>`. Copy
 * comes from `src/content/legal/*` so it can change without touching UI.
 */
export function LegalPageLayout({
  document,
}: {
  document: LegalDocument & { lastUpdatedLabel?: string }
}) {
  return (
    <Box pb={{ base: 10, md: 14 }}>
      <Container>
        <MarketingPageHeader
          title={document.title}
          description={`${document.lastUpdatedLabel ?? 'Last updated'}: ${document.lastUpdated}`}
          contentMaxW="45rem"
        >
          <Stack gap={8} maxW="45rem">
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
              <Stack
                key={section.heading}
                id={section.id}
                gap={3}
                // Clears the marketing header (58 / 66px with its borders), the
                // 56px bar under it, and 16px.
                scrollMarginTop={{ base: '130px', md: '138px' }}
              >
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
        </MarketingPageHeader>
      </Container>
    </Box>
  )
}
