'use client'

import { Badge } from '@ui'

export function WorkerSetupOptionalBadge() {
  return (
    <Badge
      bg="neutral.100"
      color="formLabelMuted"
      fontSize="10px"
      fontWeight={600}
      letterSpacing="normal"
      px={2}
      py={0.5}
      borderRadius="full"
    >
      Optional
    </Badge>
  )
}
