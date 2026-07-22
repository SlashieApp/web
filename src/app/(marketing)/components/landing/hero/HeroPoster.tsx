import { Box } from '@chakra-ui/react'

/**
 * Static, server-rendered hero artwork for the Spline pane: ink atmosphere
 * with a soft green figure glow. Shown for no-JS, reduced-motion, mobile, and
 * pre-Spline-load visitors — the surface the 3D scene cross-fades over.
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
      {/* Soft human-scale silhouette glow (decorative stand-in for the 3D figure). */}
      <Box
        position="absolute"
        inset={0}
        bgImage={`radial-gradient(14rem 22rem at 58% 62%, rgba(0, 220, 130, 0.18) 0%, transparent 70%),
          radial-gradient(10rem 10rem at 58% 28%, rgba(84, 221, 157, 0.12) 0%, transparent 72%),
          radial-gradient(18rem 12rem at 70% 80%, rgba(0, 220, 130, 0.08) 0%, transparent 75%)`}
      />
      <Box
        position="absolute"
        inset={0}
        bgImage="linear-gradient(180deg, rgba(12, 19, 16, 0.15) 0%, rgba(12, 19, 16, 0.55) 100%)"
      />
    </Box>
  )
}
