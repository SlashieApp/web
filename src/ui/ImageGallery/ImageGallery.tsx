'use client'

import {
  Box,
  type BoxProps,
  Flex,
  Grid,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

const MAX_IMAGES = 3

export type ImageGalleryItem = {
  src: string
  alt: string
}

export type ImageGalleryProps = Omit<BoxProps, 'children'> & {
  items: ImageGalleryItem[]
}

function GalleryImage({
  src,
  alt,
  borderRadius,
}: {
  src: string
  alt: string
  borderRadius: BoxProps['borderRadius']
}) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <Box
        w="full"
        h="full"
        minH="inherit"
        bg="cardAvatarEmpty"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius={borderRadius}
      >
        <Text fontSize="sm" color="formLabelMuted" textAlign="center" px={3}>
          Image unavailable
        </Text>
      </Box>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      w="full"
      h="full"
      minH="inherit"
      objectFit="cover"
      borderRadius={borderRadius}
      onError={() => setBroken(true)}
    />
  )
}

function EmptySlot({
  borderRadius,
}: { borderRadius: BoxProps['borderRadius'] }) {
  return (
    <Box
      w="full"
      h="full"
      minH="inherit"
      bg="cardAvatarEmpty"
      borderRadius={borderRadius}
      aria-hidden
    />
  )
}

function ImageOrEmpty({
  item,
  borderRadius,
}: {
  item: ImageGalleryItem | null
  borderRadius: BoxProps['borderRadius']
}) {
  if (!item) return <EmptySlot borderRadius={borderRadius} />
  return (
    <GalleryImage src={item.src} alt={item.alt} borderRadius={borderRadius} />
  )
}

function BentoShell({
  children,
  borderRadius,
}: {
  children: ReactNode
  borderRadius: BoxProps['borderRadius']
}) {
  return (
    <Box
      borderRadius={borderRadius}
      overflow="hidden"
      borderWidth="1px"
      borderColor="cardBorder"
      bg="cardBg"
      minH="inherit"
      h="full"
      w="full"
    >
      {children}
    </Box>
  )
}

function DesktopBento({ cells }: { cells: (ImageGalleryItem | null)[] }) {
  const r = '2xl'
  const [main, top, bottom] = cells

  return (
    <Grid
      templateColumns="minmax(0, 1fr) minmax(0, 1fr)"
      templateRows="minmax(0, 1fr) minmax(0, 1fr)"
      gap={2}
      minH="280px"
      w="full"
    >
      <Box gridColumn="1" gridRow="1 / span 2" minH="0" minW="0">
        <BentoShell borderRadius={r}>
          <ImageOrEmpty item={main} borderRadius={r} />
        </BentoShell>
      </Box>
      <Box gridColumn="2" gridRow="1" minH="0" minW="0">
        <BentoShell borderRadius={r}>
          <ImageOrEmpty item={top} borderRadius={r} />
        </BentoShell>
      </Box>
      <Box gridColumn="2" gridRow="2" minH="0" minW="0">
        <BentoShell borderRadius={r}>
          <ImageOrEmpty item={bottom} borderRadius={r} />
        </BentoShell>
      </Box>
    </Grid>
  )
}

function MobileCarousel({ cells }: { cells: (ImageGalleryItem | null)[] }) {
  const slides = useMemo(
    () => cells.filter((c): c is ImageGalleryItem => c !== null),
    [cells],
  )

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const syncEmblaState = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    syncEmblaState()
    emblaApi.on('select', syncEmblaState)
    emblaApi.on('reInit', syncEmblaState)
    return () => {
      emblaApi.off('select', syncEmblaState)
      emblaApi.off('reInit', syncEmblaState)
    }
  }, [emblaApi, syncEmblaState])

  if (slides.length === 0) return null

  const r = '2xl'
  const showNav = slides.length > 1
  const viewportKey = slides.map((s) => s.src).join('|')

  const navButtonProps = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    size: 'md' as const,
    variant: 'ghost' as const,
    borderRadius: 'full',
    minW: '44px',
    minH: '44px',
    bg: 'blackAlpha.600',
    color: 'white',
    _hover: { bg: 'blackAlpha.700' },
    _disabled: { opacity: 0.35, cursor: 'not-allowed' },
  }

  return (
    <Stack as="section" gap={2} w="full" aria-label="Image gallery">
      <Box position="relative" w="full">
        <Box key={viewportKey} overflow="hidden" ref={emblaRef} w="full">
          <Flex gap={0}>
            {slides.map((item, index) => (
              <Box
                key={`${item.src}-${index}`}
                flex="0 0 100%"
                minW={0}
                pr={0}
                boxSizing="border-box"
              >
                <Box
                  borderRadius={r}
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor="cardBorder"
                  bg="cardBg"
                  minH="220px"
                  maxH="360px"
                  h="52vw"
                >
                  <GalleryImage
                    src={item.src}
                    alt={item.alt}
                    borderRadius={r}
                  />
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>
        {showNav ? (
          <>
            <IconButton
              {...navButtonProps}
              left={2}
              aria-label="Previous image"
              disabled={!canScrollPrev}
              onClick={() => emblaApi?.scrollPrev()}
            >
              <LuChevronLeft size={22} aria-hidden />
            </IconButton>
            <IconButton
              {...navButtonProps}
              right={2}
              aria-label="Next image"
              disabled={!canScrollNext}
              onClick={() => emblaApi?.scrollNext()}
            >
              <LuChevronRight size={22} aria-hidden />
            </IconButton>
          </>
        ) : null}
      </Box>
      {showNav ? (
        <Box as="fieldset" borderWidth={0} p={0} m={0} minW={0}>
          <Text
            as="legend"
            position="absolute"
            width="1px"
            height="1px"
            p={0}
            m="-1px"
            overflow="hidden"
            clipPath="rect(0, 0, 0, 0)"
            whiteSpace="nowrap"
            borderWidth={0}
          >
            Slide indicators
          </Text>
          <HStack justify="center" gap={2}>
            {slides.map((slide, index) => {
              const selected = index === selectedIndex
              return (
                <Box
                  key={`dot-${slide.src}-${slide.alt}`}
                  as="button"
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  aria-label={`Image ${index + 1} of ${slides.length}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  h="6px"
                  minW={selected ? '24px' : '6px'}
                  w={selected ? '24px' : '6px'}
                  borderRadius="full"
                  bg={selected ? 'primary.500' : 'badgeBg'}
                  opacity={selected ? 1 : 0.85}
                  transitionProperty="width, min-width, opacity, background-color"
                  transitionDuration="0.2s"
                  cursor="pointer"
                  borderWidth="0"
                  p={0}
                  flexShrink={0}
                />
              )
            })}
          </HStack>
        </Box>
      ) : null}
    </Stack>
  )
}

/** Shows up to three images: Embla carousel on small viewports, bento grid from `md` up. */
export function ImageGallery({ items, ...rest }: ImageGalleryProps) {
  const isDesktop =
    useBreakpointValue({ base: false, md: true }, { fallback: 'base' }) ?? false

  const cells = useMemo<(ImageGalleryItem | null)[]>(() => {
    const v = items.slice(0, MAX_IMAGES)
    return [v[0] ?? null, v[1] ?? null, v[2] ?? null]
  }, [items])

  if (!items.length) return null

  return (
    <Box w="full" {...rest}>
      {isDesktop ? (
        <DesktopBento cells={cells} />
      ) : (
        <MobileCarousel cells={cells} />
      )}
    </Box>
  )
}
