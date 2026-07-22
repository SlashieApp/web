'use client'

import { Box, HStack, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Card, Link } from '@ui'

import type { DashboardQuickAction } from '../helpers/dashboardOverview'
import bag from '../i11n.json'

function QuickActionIcon({
  kind,
}: {
  kind: DashboardQuickAction['kind']
}) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
  }

  if (kind === 'browse') {
    return (
      <svg {...common}>
        <title>Browse</title>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="m16 16 4 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (kind === 'requests') {
    return (
      <svg {...common}>
        <title>Requests</title>
        <path
          d="M4 10.5 12 4l8 6.5V20H4v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (kind === 'quotes') {
    return (
      <svg {...common}>
        <title>Quotes</title>
        <path
          d="M5 12h14M5 7h14M5 17h10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (kind === 'profile') {
    return (
      <svg {...common}>
        <title>Profile</title>
        <circle
          cx="12"
          cy="8"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <title>Post</title>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DashboardQuickActions({
  actions,
}: {
  actions: readonly DashboardQuickAction[]
}) {
  const t = useI11n(bag)
  const href = useLocalizedHref()
  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Heading size="md">{t.quickActions.title}</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 5 }} gap={3}>
          {actions.map((item) => (
            <Link
              key={item.key}
              href={href(item.href)}
              _hover={{ textDecoration: 'none' }}
            >
              <Stack
                p={4}
                borderRadius="lg"
                bg="bg.surface"
                borderWidth="1px"
                borderColor="border.default"
                minH="106px"
                justify="space-between"
                transition="background 150ms ease-out, border-color 150ms ease-out"
                _hover={{ bg: 'bg.subtle', borderColor: 'border.strong' }}
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight={600}>
                    {item.title}
                  </Text>
                  <Box
                    w={8}
                    h={8}
                    minW={8}
                    minH={8}
                    borderRadius="full"
                    bg="status.success.soft"
                    color="status.success.fg"
                    display="grid"
                    placeItems="center"
                    aria-hidden
                  >
                    <QuickActionIcon kind={item.kind} />
                  </Box>
                </HStack>
                <Text fontSize="xs" color="text.muted">
                  {item.subtitle}
                </Text>
              </Stack>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
