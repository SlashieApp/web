import type { Metadata } from 'next'

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'

import { Footer } from '@/ui'

export const metadata: Metadata = {
  title: 'Privacy Policy | Slashie',
  description:
    'How Slashie collects, uses, and protects your data on the map-first local task marketplace.',
  alternates: { canonical: '/privacy' },
}

// NOTE: template privacy copy reflecting how the product actually works
// (public task listings with approximate location, contact sharing on
// acceptance, Stripe billing, analytics). Must be reviewed by a qualified
// lawyer / DPO before this is relied on.
const SECTIONS: Array<{ heading: string; body: string[] }> = [
  {
    heading: '1. What we collect',
    body: [
      'Account details (name, email, phone), profile information you add (photo, bio, skills, service area), task and quote content including task locations, messages and reviews, subscription billing records, and usage data (device, pages visited, approximate location from your browser when you allow it).',
    ],
  },
  {
    heading: '2. How we use it',
    body: [
      'To run the marketplace: showing tasks on the map, matching workers to nearby work, delivering quotes and notifications, processing worker subscriptions, preventing fraud and abuse, and improving the product through aggregated analytics.',
    ],
  },
  {
    heading: '3. What other users see',
    body: [
      'Tasks are public listings: title, description, budget, photos, and an approximate location are visible to workers browsing the map. Your exact address and direct contact details are shared only with the worker whose quote you accept (and, for workers, with the customer who accepts your quote). Worker profiles, verification status, and reviews are public.',
    ],
  },
  {
    heading: '4. Who we share data with',
    body: [
      'Service providers who help us run Slashie: payment processing for subscriptions (Stripe), map services (Mapbox), analytics (PostHog), and hosting/email infrastructure. They process data under contract and only for the purposes above. We never sell your personal data, and job payments happen directly between users — we hold no job-payment card data.',
    ],
  },
  {
    heading: '5. How long we keep it',
    body: [
      'Account data is kept while your account is active. Completed task and order records are retained so both parties keep a history of the work. When you close your account we delete or anonymise personal data unless we must keep it for legal, billing, or safety reasons.',
    ],
  },
  {
    heading: '6. Your rights',
    body: [
      'Under UK GDPR you can request access to, correction of, or deletion of your personal data, object to or restrict processing, and take your data with you. Contact us and we will respond within the statutory timescales. You can also complain to the ICO.',
    ],
  },
  {
    heading: '7. Cookies',
    body: [
      'We use essential cookies to keep you signed in and analytics cookies to understand how the product is used. Your browser settings control non-essential cookies.',
    ],
  },
  {
    heading: '8. Contact',
    body: ['Privacy questions or requests: support@slashie.app.'],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Box py={{ base: 10, md: 14 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Stack gap={8}>
            <Stack gap={2}>
              <Heading as="h1" size="xl">
                Privacy Policy
              </Heading>
              <Text fontSize="sm" color="text.muted">
                Last updated: 4 July 2026
              </Text>
            </Stack>
            {SECTIONS.map((section) => (
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
                    {paragraph}
                  </Text>
                ))}
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>
      <Footer variant="minimal" />
    </>
  )
}
