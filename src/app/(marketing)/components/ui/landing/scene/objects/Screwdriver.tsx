'use client'

import { Metal, Plastic } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

/** Screwdriver along +y: green grip, dark rubber rings, steel shaft. */
export function Screwdriver() {
  return (
    <group>
      <mesh position={[0, -0.36, 0]}>
        <capsuleGeometry args={[0.14, 0.42, 10, 24]} />
        <Plastic />
      </mesh>
      {[-0.5, -0.36, -0.22].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.142, 0.022, 8, 28]} />
          <Plastic color={SCENE_COLORS.plasticDark} />
        </mesh>
      ))}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.085, 0.11, 0.1, 24]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.72, 16]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.78, 0]} scale={[1, 1, 0.35]}>
        <cylinderGeometry args={[0.012, 0.04, 0.1, 16]} />
        <Metal />
      </mesh>
    </group>
  )
}
