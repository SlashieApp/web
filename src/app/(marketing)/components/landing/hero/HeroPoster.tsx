import { Box } from '@chakra-ui/react'

/**
 * Static, server-rendered hero artwork: ink-gradient "map" with green pin
 * glows and one £ beacon, drawn in CSS/SVG only. It is what reduced-motion,
 * no-WebGL, no-JS, and pre-hydration visitors see — and the surface the WebGL
 * canvas cross-fades over. References SDL tokens exclusively.
 */
export function HeroPoster() {
  return (
    <Box position="absolute" inset={0} aria-hidden overflow="hidden">
      {/* Ink terrain wash */}
      <Box
        position="absolute"
        inset={0}
        bg="bg.inverted"
        bgImage={`radial-gradient(90rem 40rem at 50% 120%, {colors.bg.invertedRaised} 0%, transparent 60%),
          radial-gradient(50rem 26rem at 18% 85%, {colors.bg.invertedSurface} 0%, transparent 70%),
          radial-gradient(46rem 24rem at 82% 75%, {colors.bg.invertedSurface} 0%, transparent 70%)`}
      />
      {/* Faint survey grid */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.12}
        bgImage={`repeating-linear-gradient(0deg, transparent, transparent 55px, {colors.border.inverted} 55px, {colors.border.inverted} 56px),
          repeating-linear-gradient(90deg, transparent, transparent 55px, {colors.border.inverted} 55px, {colors.border.inverted} 56px)`}
      />
      {/* Green pin glows — the brand color as the light source */}
      <Box
        position="absolute"
        inset={0}
        bgImage={`radial-gradient(14rem 9rem at 68% 62%, rgba(0, 220, 130, 0.2) 0%, transparent 70%),
          radial-gradient(9rem 6rem at 30% 74%, rgba(0, 220, 130, 0.14) 0%, transparent 70%),
          radial-gradient(7rem 5rem at 84% 82%, rgba(84, 221, 157, 0.12) 0%, transparent 70%)`}
      />
      {/* Static pins + one £ beacon (SVG, decorative) */}
      <Box
        as="svg"
        position="absolute"
        inset={0}
        w="full"
        h="full"
        display={{ base: 'none', md: 'block' }}
        // @ts-expect-error Chakra Box as=svg: viewBox is a valid svg attribute
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Map of local tasks</title>
        <g fill="#00DC82">
          <circle cx="810" cy="430" r="5" opacity="0.9" />
          <circle cx="362" cy="512" r="4" opacity="0.75" />
          <circle cx="1005" cy="560" r="4" opacity="0.7" />
          <circle cx="540" cy="470" r="3.5" opacity="0.6" />
          <circle cx="680" cy="555" r="3.5" opacity="0.6" />
        </g>
        <g>
          <rect
            x="756"
            y="356"
            width="108"
            height="44"
            rx="22"
            fill="#00DC82"
          />
          <text
            x="810"
            y="385"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="22"
            fontWeight="700"
            fill="#0A1512"
          >
            £80
          </text>
        </g>
      </Box>
      {/* Gentle vignette for copy legibility */}
      <Box
        position="absolute"
        inset={0}
        bgImage="radial-gradient(120% 90% at 50% 45%, transparent 55%, {colors.bg.inverted} 100%)"
      />
    </Box>
  )
}
