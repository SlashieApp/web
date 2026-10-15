import { Box } from '@chakra-ui/react'
import { Center, Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentType } from 'react'
import { NeutralToneMapping } from 'three'

import { type SceneObjectId, poseFor } from '../formations'
import { Boxes as BoxesModel } from './Boxes'
import { MapPin as MapPinModel } from './MapPin'
import { MopBucket as MopBucketModel } from './MopBucket'
import { PaintRoller as PaintRollerModel } from './PaintRoller'
import { Screwdriver as ScrewdriverModel } from './Screwdriver'
import { Toolbox as ToolboxModel } from './Toolbox'

/** Story-only: the landing scene's light rig (see `LandingScene.tsx`). */
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.5} />
      <directionalLight position={[-5, -2, 4]} intensity={0.35} />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 5, 4]}
          scale={[10, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-6, 0, 2]}
          rotation-y={Math.PI / 2}
          scale={[6, 6, 1]}
          color="#E7FBF0"
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          position={[6, -1, 2]}
          rotation-y={-Math.PI / 2}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="circle"
          intensity={1.4}
          position={[2, 3, 6]}
          scale={1.5}
        />
      </Environment>
    </>
  )
}

/**
 * Story-only: one object alone on the mint wash, centred, in the angle it has
 * in the hero formation, lit and tone mapped like the landing scene.
 */
function ObjectStage({
  id,
  Model,
  distance,
}: {
  id: SceneObjectId
  Model: ComponentType
  /** Camera distance: larger objects sit further back. */
  distance: number
}) {
  const { rx, ry, rz } = poseFor(id, 'hero', false)
  return (
    <Box
      w="full"
      maxW="32rem"
      h="26rem"
      borderRadius="lg"
      overflow="hidden"
      bgGradient="to-b"
      gradientFrom="status.success.soft"
      gradientTo="bg.canvas"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, distance], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping
        }}
        aria-hidden
      >
        <SceneLights />
        <group rotation={[rx, ry, rz]}>
          <Center>
            <Model />
          </Center>
        </group>
      </Canvas>
    </Box>
  )
}

/** Gallery of the six procedural landing objects, each alone and centred. */
const meta = {
  title: 'Marketing/Landing/SceneObjects',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Toolbox: green plastic body, carry handle, metal latches, hammer, spanner and a screwdriver in the tray. */
export const Toolbox: Story = {
  render: () => (
    <ObjectStage id="toolbox" Model={ToolboxModel} distance={5.2} />
  ),
}

/** Mop bucket: green bucket with a wire handle, a mop stick and fabric strands over the rim. */
export const MopBucket: Story = {
  render: () => (
    <ObjectStage id="bucket" Model={MopBucketModel} distance={6.8} />
  ),
}

/** Boxes: a small stack of three moving boxes sealed with green tape. */
export const Boxes: Story = {
  render: () => <ObjectStage id="boxes" Model={BoxesModel} distance={5.6} />,
}

/** Paint roller: striped fabric sleeve, bent wire frame and a green grip. */
export const PaintRoller: Story = {
  render: () => (
    <ObjectStage id="roller" Model={PaintRollerModel} distance={5.4} />
  ),
}

/** Screwdriver: green grip with dark rubber rings, steel shaft and flat tip. */
export const Screwdriver: Story = {
  render: () => (
    <ObjectStage id="screwdriver" Model={ScrewdriverModel} distance={5} />
  ),
}

/** Map pin: the soft bevelled green teardrop with a round hole, from the key art. */
export const MapPin: Story = {
  render: () => <ObjectStage id="pin" Model={MapPinModel} distance={5} />,
}
