'use client'

import { BevelBox, Matte } from '../materials'
import { SCENE_COLORS, type SceneColor } from '../scenePalette'

type Vec3 = [number, number, number]

/**
 * One plain box with a thin lid seam. `strap` adds the green strap: a band
 * over the top and down the front and back, the one green part of the stack.
 */
function Box({
  size,
  position,
  rotation,
  color,
  strap = false,
}: {
  size: Vec3
  position: Vec3
  rotation: Vec3
  color: SceneColor
  strap?: boolean
}) {
  const [w, h, d] = size
  return (
    <group position={position} rotation={rotation}>
      <BevelBox args={size} bevel={0.04} color={color} />
      {/* Flap seam across the lid. */}
      <mesh position={[0, h / 2 + 0.002, 0]}>
        <boxGeometry args={[w * 0.94, 0.004, 0.012]} />
        <Matte color={SCENE_COLORS.neutral400} />
      </mesh>
      {strap ? (
        <mesh>
          <boxGeometry args={[0.17, h + 0.012, d + 0.012]} />
          <Matte color={SCENE_COLORS.accent} />
        </mesh>
      ) : null}
    </group>
  )
}

/** A small stack of three boxes, white and zinc, strapped in green on top. */
export function Boxes() {
  return (
    <group>
      <Box
        size={[1, 0.72, 0.82]}
        position={[-0.34, -0.3, 0]}
        rotation={[0, 0.25, 0]}
        color={SCENE_COLORS.white}
      />
      <Box
        size={[0.86, 0.66, 0.74]}
        position={[0.56, -0.33, -0.1]}
        rotation={[0, -0.35, 0]}
        color={SCENE_COLORS.neutral300}
      />
      <Box
        size={[0.78, 0.58, 0.66]}
        position={[0.04, 0.34, 0.02]}
        rotation={[0, -0.1, 0]}
        color={SCENE_COLORS.neutral200}
        strap
      />
    </group>
  )
}
