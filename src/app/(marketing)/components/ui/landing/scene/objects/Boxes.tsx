'use client'

import { RoundedBox } from '@react-three/drei'

import { Cardboard, Plastic } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

type Vec3 = [number, number, number]

/** One cardboard box sealed with green tape over the top and down the sides. */
function TapedBox({
  size,
  position,
  rotation,
}: {
  size: Vec3
  position: Vec3
  rotation: Vec3
}) {
  const [w, h, d] = size
  const tapeDrop = h * 0.36
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={size} radius={0.04} smoothness={3}>
        <Cardboard />
      </RoundedBox>
      <mesh position={[0, h / 2 + 0.006, 0]}>
        <boxGeometry args={[0.17, 0.012, d + 0.012]} />
        <Plastic color={SCENE_COLORS.plasticLight} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[0, h / 2 - tapeDrop / 2, (side * (d + 0.012)) / 2]}
        >
          <boxGeometry args={[0.17, tapeDrop, 0.012]} />
          <Plastic color={SCENE_COLORS.plasticLight} />
        </mesh>
      ))}
      {/* Flap seam either side of the tape. */}
      <mesh position={[0, h / 2 + 0.002, 0]}>
        <boxGeometry args={[w * 0.94, 0.004, 0.012]} />
        <Cardboard color={SCENE_COLORS.cardboardDark} />
      </mesh>
    </group>
  )
}

/** A small stack of moving boxes. */
export function Boxes() {
  return (
    <group>
      <TapedBox
        size={[1, 0.72, 0.82]}
        position={[-0.34, -0.3, 0]}
        rotation={[0, 0.25, 0]}
      />
      <TapedBox
        size={[0.86, 0.66, 0.74]}
        position={[0.56, -0.33, -0.1]}
        rotation={[0, -0.35, 0]}
      />
      <TapedBox
        size={[0.78, 0.58, 0.66]}
        position={[0.04, 0.34, 0.02]}
        rotation={[0, -0.1, 0]}
      />
    </group>
  )
}
