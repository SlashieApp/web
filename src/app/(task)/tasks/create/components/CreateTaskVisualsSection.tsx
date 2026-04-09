'use client'

import { Box, HStack, Image, Stack } from '@chakra-ui/react'
import { useRef } from 'react'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { Heading, Text } from '@ui'

export type CreateTaskVisualsSectionProps = {
  files: File[]
  previews: string[]
  onFilesAdded: (files: FileList | null) => void
  onRemoveFile: (index: number) => void
}

export function CreateTaskVisualsSection({
  files,
  previews,
  onFilesAdded,
  onRemoveFile,
}: CreateTaskVisualsSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={4}>
        <Heading size="lg" color="primary.700">
          3. Visuals
        </Heading>
        <Text fontSize="sm" color="muted">
          Photos help contractors give more accurate quotes.
        </Text>

        <Box
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border"
          borderRadius="xl"
          p={6}
          bg="surfaceContainerLow"
        >
          <Stack align="center" gap={3}>
            <Text fontSize="sm" color="muted" textAlign="center">
              Upload images of the job area or problem (optional).
            </Text>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                onFilesAdded(e.target.files)
                e.target.value = ''
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              Upload
            </Button>
          </Stack>
        </Box>

        {previews.length > 0 ? (
          <HStack gap={3} flexWrap="wrap" align="flex-start">
            {previews.map((src, i) => (
              <Box key={`${i}-${files[i]?.name ?? 'img'}`} position="relative">
                <Image
                  src={src}
                  alt=""
                  boxSize="88px"
                  objectFit="cover"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border"
                />
                <Button
                  type="button"
                  size="xs"
                  variant="subtle"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => onRemoveFile(i)}
                >
                  ×
                </Button>
              </Box>
            ))}
          </HStack>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
