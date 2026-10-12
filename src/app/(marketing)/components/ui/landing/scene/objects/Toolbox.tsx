'use client'

import { RoundedBox } from '@react-three/drei'

import { Metal, Plastic, Wood } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

/** Green toolbox with a carry handle and tools poking out of the tray. */
export function Toolbox() {
  return (
    <group>
      <RoundedBox args={[1.6, 0.72, 0.86]} radius={0.12} smoothness={4}>
        <Plastic />
      </RoundedBox>
      <RoundedBox
        args={[1.66, 0.1, 0.92]}
        radius={0.05}
        smoothness={3}
        position={[0, 0.3, 0]}
      >
        <Plastic color={SCENE_COLORS.plasticDark} />
      </RoundedBox>
      {[-0.52, 0.52].map((x) => (
        <RoundedBox
          key={`latch-${x}`}
          args={[0.2, 0.22, 0.06]}
          radius={0.03}
          smoothness={2}
          position={[x, 0.18, 0.45]}
        >
          <Metal />
        </RoundedBox>
      ))}

      {/* Carry handle */}
      {[-0.42, 0.42].map((x) => (
        <RoundedBox
          key={`post-${x}`}
          args={[0.14, 0.34, 0.16]}
          radius={0.05}
          smoothness={3}
          position={[x, 0.5, 0]}
        >
          <Plastic color={SCENE_COLORS.plasticDark} />
        </RoundedBox>
      ))}
      <RoundedBox
        args={[0.98, 0.14, 0.18]}
        radius={0.06}
        smoothness={3}
        position={[0, 0.68, 0]}
      >
        <Plastic color={SCENE_COLORS.plasticDark} />
      </RoundedBox>

      {/* Hammer */}
      <group position={[-0.5, 0.42, -0.18]} rotation={[0, 0, 0.32]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.7, 16]} />
          <Wood />
        </mesh>
        <RoundedBox
          args={[0.42, 0.13, 0.13]}
          radius={0.03}
          smoothness={2}
          position={[0.06, 0.62, 0]}
        >
          <Metal />
        </RoundedBox>
      </group>

      {/* Spanner */}
      <group position={[0.36, 0.46, -0.2]} rotation={[0, 0, -0.28]}>
        <RoundedBox
          args={[0.09, 0.7, 0.035]}
          radius={0.015}
          smoothness={2}
          position={[0, 0.22, 0]}
        >
          <Metal />
        </RoundedBox>
        <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI * 0.7]}>
          <torusGeometry args={[0.1, 0.035, 12, 24, Math.PI * 1.6]} />
          <Metal />
        </mesh>
      </group>

      {/* Screwdriver handle in the tray */}
      <group position={[0.04, 0.5, -0.26]} rotation={[0, 0, 0.12]}>
        <mesh position={[0, 0.12, 0]}>
          <capsuleGeometry args={[0.07, 0.24, 8, 16]} />
          <Plastic color={SCENE_COLORS.plasticLight} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.3, 10]} />
          <Metal />
        </mesh>
      </group>
    </group>
  )
}
