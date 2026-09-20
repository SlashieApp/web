import { Box, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { LuImage } from 'react-icons/lu'

import { Card } from '@ui'

/**
 * Portfolio. Upload is Stage 3; setup already collects `portfolioUrls`, so
 * real photos render when present — otherwise three "coming soon" tiles per
 * the v2 mockup.
 */
export function WorkerPortfolioSection({
  portfolioUrls,
  workerName,
}: {
  portfolioUrls: readonly string[]
  workerName: string
}) {
  const photos = portfolioUrls.map((url) => url.trim()).filter(Boolean)

  return (
    <Card layout="section" heading="Portfolio">
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
        {photos.length > 0
          ? photos.slice(0, 6).map((url) => (
              <Box
                key={url}
                borderRadius="lg"
                overflow="hidden"
                borderWidth="1px"
                borderColor="border.default"
                aspectRatio={4 / 3}
              >
                <Image
                  src={url}
                  alt={`Work by ${workerName}`}
                  w="full"
                  h="full"
                  objectFit="cover"
                  display="block"
                />
              </Box>
            ))
          : [0, 1, 2].map((tile) => (
              <Stack
                key={tile}
                align="center"
                justify="center"
                gap={2}
                aspectRatio={4 / 3}
                borderRadius="lg"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="border.default"
                bg="bg.subtle"
                color="text.muted"
              >
                <Box as="span" aria-hidden display="inline-flex">
                  <LuImage size={20} strokeWidth={1.8} />
                </Box>
                <Text fontSize="xs" fontWeight={600} textAlign="center" px={2}>
                  Work photos coming soon
                </Text>
              </Stack>
            ))}
      </SimpleGrid>
    </Card>
  )
}
