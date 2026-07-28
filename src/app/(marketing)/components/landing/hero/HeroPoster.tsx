import { Box } from '@chakra-ui/react'

/**
 * Static, server-rendered hero artwork for the globe pane: ink atmosphere
 * with a soft green spherical glow. Shown for no-JS, reduced-motion, and
 * pre-WebGL-load visitors — the surface the COBE globe cross-fades over.
 */
export function HeroPoster() {
  return (
    <Box position="absolute" inset={0} aria-hidden overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        bg="bg.inverted"
        bgImage={`radial-gradient(42rem 36rem at 62% 48%, {colors.bg.invertedRaised} 0%, transparent 68%),
          radial-gradient(28rem 22rem at 40% 70%, {colors.bg.invertedSurface} 0%, transparent 72%)`}
      />
      {/* Soft globe-scale glow (decorative stand-in for the WebGL sphere). */}
      <Box
        position="absolute"
        inset={0}
        bgImage={`radial-gradient(circle at 58% 52%, rgba(0, 220, 130, 0.16) 0%, transparent 42%),
          radial-gradient(circle at 58% 52%, rgba(84, 221, 157, 0.1) 0%, transparent 58%),
          radial-gradient(18rem 12rem at 70% 78%, rgba(0, 220, 130, 0.07) 0%, transparent 75%)`}
      />
      <Box
        position="absolute"
        inset={0}
        bgImage="linear-gradient(180deg, rgba(12, 19, 16, 0.15) 0%, rgba(12, 19, 16, 0.55) 100%)"
      />
    </Box>
  )
}
