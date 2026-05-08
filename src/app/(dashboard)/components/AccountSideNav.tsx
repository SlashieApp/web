'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { ACCOUNT_NAV, type AccountNavKey } from '../helpers/accountNav'

type AccountSideNavProps = {
  active: AccountNavKey
}

/** Desktop side nav for the merged account hub (mobile uses tab strip). */
export function AccountSideNav({ active }: AccountSideNavProps) {
  return (
    <Stack as="nav" aria-label="Account sections" gap={1} w="full">
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            as={NextLink}
            href={item.href}
            display="flex"
            alignItems="center"
            gap={3}
            px={3}
            py={2.5}
            borderRadius="lg"
            bg={isActive ? 'primary.100' : 'transparent'}
            color={isActive ? 'primary.800' : 'cardFg'}
            fontWeight={isActive ? 700 : 600}
            fontSize="sm"
            _hover={{
              textDecoration: 'none',
              bg: isActive ? 'primary.100' : 'cardBg',
            }}
          >
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={isActive ? 'primary.600' : 'transparent'}
              aria-hidden
            />
            <Text>{item.label}</Text>
          </Link>
        )
      })}
    </Stack>
  )
}

/** Mobile horizontal tab strip used above page content. */
export function AccountTabStrip({ active }: AccountSideNavProps) {
  return (
    <HStack
      as="nav"
      aria-label="Account sections"
      gap={2}
      overflowX="auto"
      px={4}
      py={2}
      borderBottomWidth="1px"
      borderColor="cardBorder"
      bg="bg"
      css={{
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            as={NextLink}
            href={item.href}
            flexShrink={0}
            px={3}
            py={2}
            borderRadius="full"
            fontSize="sm"
            fontWeight={isActive ? 700 : 600}
            whiteSpace="nowrap"
            bg={isActive ? 'primary' : 'cardBg'}
            color={isActive ? 'black' : 'cardFg'}
            borderWidth={isActive ? 0 : '1px'}
            borderColor="cardBorder"
            boxShadow={isActive ? 'sm' : 'none'}
            _hover={{ textDecoration: 'none', opacity: 0.92 }}
          >
            {item.label}
          </Link>
        )
      })}
    </HStack>
  )
}
