'use client'

import { Stack, Text } from '@chakra-ui/react'
import type { ComponentProps, ReactNode } from 'react'

import { Button } from '../Button/Button'

export type AddPhotoTileProps = ComponentProps<typeof Button> & {
  icon: ReactNode
  label: string
  /** Width and height, the photo tiles' own, such as "88px". */
  tileSize: string
}

/**
 * SDL AddPhotoTile. The dashed tile after a row of photo tiles that adds
 * more. Spread a `PhotoSourcePicker` trigger on it: camera or library on
 * touch screens, the file picker with a mouse.
 */
export function AddPhotoTile({
  icon,
  label,
  tileSize,
  ...props
}: AddPhotoTileProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      h={tileSize}
      minW={tileSize}
      borderStyle="dashed"
      borderWidth="2px"
      {...props}
    >
      <Stack gap={1} align="center">
        {icon}
        <Text as="span" fontSize="sm">
          {label}
        </Text>
      </Stack>
    </Button>
  )
}
