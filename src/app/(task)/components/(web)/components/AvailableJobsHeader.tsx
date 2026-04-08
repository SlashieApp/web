'use client'

import { HStack, NativeSelect, Stack } from '@chakra-ui/react'
import { Heading, IconSliders, Text } from '@ui'

export type SortOption = {
  value: string
  label: string
}

export type AvailableJobsHeaderProps = {
  title: string
  subtitle: string
  sortValue: string
  sortOptions: readonly SortOption[]
  onSortChange: (value: string) => void
}

export function AvailableJobsHeader({
  title,
  subtitle,
  sortValue,
  sortOptions,
  onSortChange,
}: AvailableJobsHeaderProps) {
  return (
    <Stack
      gap={{ base: 4, md: 2 }}
      align={{ base: 'stretch', md: 'flex-start' }}
    >
      <HStack
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        gap={4}
        flexWrap="wrap"
        w="full"
      >
        <Stack gap={2} flex="1" minW="min(100%, 280px)">
          <Heading size="xl" letterSpacing="-0.02em" color="fg">
            {title}
          </Heading>
          <Text color="muted" fontSize="md" lineHeight="1.5">
            {subtitle}
          </Text>
        </Stack>
        <HStack
          gap={2}
          align="center"
          flexShrink={0}
          bg="surfaceContainerHigh"
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          py={2}
          px={3}
          w={{ base: 'full', sm: 'auto' }}
        >
          <IconSliders aria-hidden />
          <Text
            fontSize="sm"
            fontWeight={600}
            color="muted"
            whiteSpace="nowrap"
          >
            Sort by:
          </Text>
          <NativeSelect.Root flex={1} minW={0}>
            <NativeSelect.Field
              aria-label="Sort tasks"
              bg="transparent"
              borderWidth={0}
              color="fg"
              fontWeight={600}
              fontSize="sm"
              py={0}
              px={1}
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
        </HStack>
      </HStack>
    </Stack>
  )
}
