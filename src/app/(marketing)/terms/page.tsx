import type { Metadata } from 'next'

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'

import { Footer } from '@/ui'

export const metadata: Metadata = {
  title: 'Terms of Service | Slashie',
  description:
    'The terms that govern using Slashie — the map-first local task marketplace connecting customers and workers.',
  alternates: { canonical: '/terms' },
}

// NOTE: template legal copy reflecting how the product actually works
// (connect-only marketplace, direct customer<->worker payment, worker
// subscription billed by Slashie). Must be reviewed by a qualified lawyer
// before this is relied on.
const SECTIONS: Array<{ heading: string; body: string[] }> = [
  {
    heading: '1. What Slashie is',
    body: [
      'Slashie is a map-first local task marketplace. Customers post tasks, nearby workers send quotes, and the customer chooses who to hire. Slashie provides discovery, quoting, messaging, and reputation tools — we are not a party to the agreement between a customer and a worker, and we do not supply, employ, or subcontract workers.',
    ],
  },
  {
    heading: '2. Accounts',
    body: [
      'You need an account to post tasks or send quotes. You must provide accurate information, keep your credentials secure, and be at least 18 years old. You are responsible for activity on your account.',
    ],
  },
  {
    heading: '3. Tasks and quotes',
    body: [
      'Customers are responsible for describing tasks accurately, including location, budget, and timing. Workers are responsible for the accuracy of their quotes and profiles. A contract for the work is formed directly between the customer and the worker when a quote is accepted.',
      'Task details and approximate locations are visible to other users so workers can find nearby work. Exact contact details are shared only when a quote is accepted.',
    ],
  },
  {
    heading: '4. Payment for jobs',
    body: [
      'Payment for jobs is arranged directly between customer and worker, outside Slashie. Slashie never holds, processes, or releases job money, takes no commission on jobs, and is not responsible for payment disputes between users — though we may suspend accounts involved in bad-faith conduct.',
    ],
  },
  {
    heading: '5. Worker subscriptions',
    body: [
      'Workers can use a free quoting tier or subscribe for unlimited quoting. Subscription fees are billed by Slashie, are separate from job payments, and are subject to the pricing shown at the time of purchase. You can cancel any time; access continues to the end of the paid period.',
    ],
  },
  {
    heading: '6. Conduct and content',
    body: [
      'You agree not to post unlawful, misleading, or abusive content; to only post tasks you genuinely intend to have done; and to only quote work you are able to carry out. Reviews must reflect genuine experiences. We may remove content or restrict accounts that break these rules.',
    ],
  },
  {
    heading: '7. Liability',
    body: [
      'Slashie provides the marketplace "as is". To the fullest extent permitted by law, we are not liable for the quality, safety, legality, or outcome of work arranged through the platform, or for losses arising from dealings between users. Nothing in these terms limits liability that cannot be limited by law.',
    ],
  },
  {
    heading: '8. Ending your account',
    body: [
      'You can close your account at any time. We may suspend or terminate accounts that breach these terms or put other users at risk.',
    ],
  },
  {
    heading: '9. Changes',
    body: [
      'We may update these terms as the product evolves. Material changes will be announced in the app; continued use after a change means you accept the updated terms.',
    ],
  },
  {
    heading: '10. Contact',
    body: ['Questions about these terms: support@slashie.app.'],
  },
]

export default function TermsPage() {
  return (
    <>
      <Box py={{ base: 10, md: 14 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Stack gap={8}>
            <Stack gap={2}>
              <Heading as="h1" size="xl">
                Terms of Service
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
