'use client'

import { useMemo } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'

import { Fabric, Metal, Plastic } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

/** Paint roller: striped sleeve, bent wire frame, green grip. */
export function PaintRoller() {
  const frame = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(0.44, 0, 0),
        new Vector3(0.62, 0, 0),
        new Vector3(0.66, -0.26, 0),
        new Vector3(0.36, -0.55, 0),
        new Vector3(0.05, -0.75, 0),
      ]),
    [],
  )

  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.86, 40]} />
        <Fabric />
      </mesh>
      {[-0.26, 0, 0.26].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.243, 0.032, 8, 40]} />
          <Plastic color={SCENE_COLORS.plasticLight} />
        </mesh>
      ))}
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
          <Metal />
        </mesh>
      ))}
      <mesh>
        <tubeGeometry args={[frame, 48, 0.028, 10, false]} />
        <Metal />
      </mesh>
      <group position={[-0.23, -0.94, 0]} rotation={[0, 0, -0.98]}>
        <mesh>
          <capsuleGeometry args={[0.085, 0.5, 8, 16]} />
          <Plastic />
        </mesh>
        {[-0.14, 0, 0.14].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.088, 0.016, 8, 24]} />
            <Plastic color={SCENE_COLORS.plasticDark} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
