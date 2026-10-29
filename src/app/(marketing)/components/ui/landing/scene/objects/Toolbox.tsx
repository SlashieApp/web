'use client'

import { BevelBox, Matte } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

/** Radial segments of every round part: the low-poly look. */
const SIDES = 8

/**
 * A toolbox with a carry handle, a hammer and a spanner in the tray. White and
 * zinc, flat shaded; the carry grip is the one green part.
 */
export function Toolbox() {
  return (
    <group>
      <BevelBox
        args={[1.6, 0.72, 0.86]}
        bevel={0.07}
        color={SCENE_COLORS.neutral200}
      />
      {/* Lid rim */}
      <BevelBox
        args={[1.66, 0.1, 0.92]}
        bevel={0.04}
        position={[0, 0.3, 0]}
        color={SCENE_COLORS.white}
      />
      {[-0.52, 0.52].map((x) => (
        <BevelBox
          key={`latch-${x}`}
          args={[0.2, 0.22, 0.06]}
          bevel={0.02}
          position={[x, 0.18, 0.45]}
          color={SCENE_COLORS.neutral500}
        />
      ))}

      {/* Carry handle: two posts and the green grip */}
      {[-0.42, 0.42].map((x) => (
        <BevelBox
          key={`post-${x}`}
          args={[0.14, 0.34, 0.16]}
          bevel={0.03}
          position={[x, 0.5, 0]}
          color={SCENE_COLORS.neutral400}
        />
      ))}
      <BevelBox
        args={[1, 0.16, 0.2]}
        bevel={0.05}
        position={[0, 0.68, 0]}
        color={SCENE_COLORS.accent}
      />

      {/* Hammer */}
      <group position={[-0.5, 0.42, -0.18]} rotation={[0, 0, 0.32]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.7, SIDES]} />
          <Matte color={SCENE_COLORS.neutral400} />
        </mesh>
        <BevelBox
          args={[0.42, 0.13, 0.13]}
          bevel={0.025}
          position={[0.06, 0.62, 0]}
          color={SCENE_COLORS.ink}
        />
      </group>

      {/* Spanner */}
      <group position={[0.36, 0.46, -0.2]} rotation={[0, 0, -0.28]}>
        <BevelBox
          args={[0.09, 0.7, 0.035]}
          bevel={0.012}
          position={[0, 0.22, 0]}
          color={SCENE_COLORS.neutral300}
        />
        <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI * 0.7]}>
          <torusGeometry args={[0.1, 0.035, 6, 6, Math.PI * 1.6]} />
          <Matte color={SCENE_COLORS.neutral300} />
        </mesh>
      </group>
    </group>
  )
}
