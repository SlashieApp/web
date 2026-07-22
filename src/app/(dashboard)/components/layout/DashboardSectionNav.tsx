'use client'

import { Box, HStack } from '@chakra-ui/react'

import { Link } from '@ui'

export type DashboardSectionNavItem = {
  label: string
  href: string
}

export function DashboardSectionNav({
  items,
  activeHref,
}: {
  items: readonly DashboardSectionNavItem[]
  /** When omitted, the first item is treated as active. */
  activeHref?: string
}) {
  const current = activeHref ?? items[0]?.href

  return (
    <Box
      overflowX="auto"
      borderBottomWidth="1px"
      borderColor="border.default"
      scrollbarWidth="none"
      css={{ '&::-webkit-scrollbar': { display: 'none' } }}
    >
      <HStack gap={6} minW="max-content" px={1}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            tone="muted"
            fontSize="sm"
            fontWeight={600}
            py={3}
            borderBottomWidth="2px"
            borderColor={
              item.href === current ? 'action.primary' : 'transparent'
            }
            _hover={{
              textDecoration: 'none',
              color: 'text.link',
              borderColor: 'action.primary',
            }}
          >
            {item.label}
          </Link>
        ))}
      </HStack>
    </Box>
  )
}
