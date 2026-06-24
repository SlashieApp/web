'use client'

import { Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useRef } from 'react'

import { Button, Card } from '@ui'

export type CreateTaskVisualsSectionProps = {
  files: File[]
  previews: string[]
  /** Snapshot `File[]` in the change handler before clearing the input (mobile-safe). */
  onFilesAdded: (files: File[]) => void
  onRemoveFile: (index: number) => void
  /** Already-uploaded URLs (edit flow). */
  existingImageUrls?: string[]
  sectionHeading?: string
}

export function CreateTaskVisualsSection({
  files,
  previews,
  onFilesAdded,
  onRemoveFile,
  existingImageUrls = [],
  sectionHeading = '4. Visuals',
}: CreateTaskVisualsSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Card
      layout="section"
      bodyGap={4}
      header={
        <Heading size="lg" color="text.link">
          {sectionHeading}
        </Heading>
      }
    >
      <Text fontSize="sm" color="text.muted">
        Photos help workers give more accurate quotes.
      </Text>

      <Box
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="border.default"
        borderRadius="xl"
        p={6}
        bg="neutral.100"
      >
        <Stack align="center" gap={3}>
          <Text fontSize="sm" color="text.muted" textAlign="center">
            Upload images of the job area or problem (optional).
          </Text>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const picked =
                e.target.files && e.target.files.length > 0
                  ? Array.from(e.target.files)
                  : []
              e.target.value = ''
              if (picked.length > 0) {
                onFilesAdded(picked)
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </Button>
        </Stack>
      </Box>

      {existingImageUrls.length > 0 ? (
        <HStack gap={3} flexWrap="wrap" align="flex-start">
          {existingImageUrls.map((src) => (
            <Image
              key={src}
              src={src}
              alt="Task photo"
              boxSize="88px"
              objectFit="cover"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border.default"
            />
          ))}
        </HStack>
      ) : null}

      {previews.length > 0 ? (
        <HStack gap={3} flexWrap="wrap" align="flex-start">
          {previews.map((src, i) => {
            const file = files[i]
            const stableKey = file
              ? `${file.name}-${file.size}-${file.lastModified}`
              : `${i}-${src.slice(0, 24)}`
            return (
              <Box key={stableKey} position="relative">
                <Image
                  src={src}
                  alt={file ? `Preview: ${file.name}` : ''}
                  boxSize="88px"
                  objectFit="cover"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border.default"
                />
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => onRemoveFile(i)}
                >
                  ×
                </Button>
              </Box>
            )
          })}
        </HStack>
      ) : null}
    </Card>
  )
}
