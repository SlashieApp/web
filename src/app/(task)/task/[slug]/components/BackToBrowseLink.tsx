'use client'

import { Link } from '@chakra-ui/react'
import NextLink from 'next/link'

export function BackToBrowseLink() {
  return (
    <Link
      as={NextLink}
      href="/"
      fontWeight={600}
      color="formLabelMuted"
      fontSize="sm"
      w="fit-content"
      _hover={{ textDecoration: 'none' }}
    >
      ← Back to browse
    </Link>
  )
}
