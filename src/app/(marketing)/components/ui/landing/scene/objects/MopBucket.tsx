'use client'

import { QuadraticBezierCurve3, Vector3 } from 'three'

import { Fabric, Metal, Plastic, Wood } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

const STRANDS = 18

/**
 * Each strand rises from inside the bucket, arcs over the rim and hangs
 * down the outside. Lengths vary so the mop looks loose, not combed.
 */
const STRAND_CURVES = Array.from({ length: STRANDS }, (_, i) => {
  const angle = (i / STRANDS) * Math.PI * 2 + (i % 2) * 0.12
  const hang = 0.12 + (i % 3) * 0.1
  const tip = new Vector3(0.74, hang, 0)
  return {
    angle,
    tip,
    curve: new QuadraticBezierCurve3(
      new Vector3(0.12, 0.42, 0),
      new Vector3(0.6, 0.82 - (i % 3) * 0.06, 0),
      tip,
    ),
  }
})

/** Green bucket with a wire handle and a mop spilling over the rim. */
export function MopBucket() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.62, 0.5, 0.9, 48]} />
        <Plastic />
      </mesh>
      {/* Dark disc just under the rim fakes the open top. */}
      <mesh position={[0, 0.452, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 48]} />
        <Plastic color={SCENE_COLORS.plasticDeep} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.61, 0.045, 12, 48]} />
        <Plastic color={SCENE_COLORS.plasticLight} />
      </mesh>
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.535, 0.03, 10, 48]} />
        <Plastic color={SCENE_COLORS.plasticDark} />
      </mesh>

      {/* Wire handle, tipped back. */}
      <mesh position={[0, 0.45, 0]} rotation={[-0.55, 0, 0]}>
        <torusGeometry args={[0.6, 0.018, 8, 32, Math.PI]} />
        <Metal />
      </mesh>

      {/* Mop stick leaning out of the bucket. */}
      <mesh position={[-0.28, 1.05, 0.05]} rotation={[0.12, 0, 0.36]}>
        <cylinderGeometry args={[0.036, 0.036, 2, 12]} />
        <Wood />
      </mesh>

      {/* Mop head: strands draped over the rim. */}
      {STRAND_CURVES.map(({ curve, angle, tip }) => (
        <group key={angle} rotation={[0, angle, 0]}>
          <mesh>
            <tubeGeometry args={[curve, 20, 0.055, 8, false]} />
            <Fabric />
          </mesh>
          <mesh position={tip}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <Fabric />
          </mesh>
        </group>
      ))}
    </group>
  )
}
