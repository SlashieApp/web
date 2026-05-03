'use client'

import { Link } from '@chakra-ui/react'
import NextLink from 'next/link'

export function TaskDetailBackToBrowseLink() {
  return (
    <Link
      as={NextLink}
      href="/"
      fontWeight={600}
      color="formLabelMuted"
      fontSize="sm"
      _hover={{ textDecoration: 'none' }}
    >
      ← Back to browse
    </Link>
  )
}
