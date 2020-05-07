import { mapValues } from 'lodash'
import React, { forwardRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Canvas, extend, ReactThreeFiber } from 'react-three-fiber'
import { Object3D, Texture, TextureLoader, Vector3 } from 'three'

import {
  doHoverPart,
  doSelectParts,
  doUnhoverPart,
  doUpdateSelectedParts,
  getCurrentSpecSize,
  getParts,
  MaterialId,
  PartType,
  PartValue,
} from '../../store'
import { Sky as SkyImpl } from '../../vendor/Sky'
import Clipboard from '../clipboard'
import { GlProvider } from '../provider'
import Beam from './beam'
import Camera from './camera'
import Scale from './scale'
import Selector from './selection'

export type TexturePathsByMaterialType = Record<MaterialId, string>
export type TexturesByMaterialType = Record<MaterialId, Texture>

const texturePathsByMaterialType: TexturePathsByMaterialType = {
  [MaterialId.Wood]: require('../../textures/pine.jpg'),
  [MaterialId.Steel]: require('../../textures/pine.jpg'),
  [MaterialId.Aluminum]: require('../../textures/pine.jpg'),
}

export default Gl

interface GlProps {}

function Gl(props: GlProps) {
  const dispatch = useDispatch()

  const parts = useSelector(getParts)

  const currentSize = useSelector(getCurrentSpecSize)
  if (currentSize == null) throw new Error('currentSize is null')
  const currentBeamWidth = currentSize.normalizedBeamWidth

  const texturesByMaterialType: TexturesByMaterialType = React.useMemo(() => {
    return mapValues(texturePathsByMaterialType, (texturePath) => {
      return new TextureLoader().load(texturePath)
    })
  }, [])

  const renderParts = useCallback(
    (parts: Array<PartValue>) =>
      parts.map((part) => {
        const { uuid } = part
        const partProps = {
          ...part,
          hover: () => dispatch(doHoverPart(uuid)),
          unhover: () => dispatch(doUnhoverPart(uuid)),
          select: () => dispatch(doSelectParts([uuid])),
          move: (delta: [number, number, number]) =>
            dispatch(
              doUpdateSelectedParts([
                { update: 'add', path: 'origin.x', value: delta[0] },
                { update: 'add', path: 'origin.y', value: delta[1] },
                { update: 'add', path: 'origin.z', value: delta[2] },
              ]),
            ),
        }
        if (part.type === PartType.Beam) {
          return (
            <Beam
              key={part.uuid}
              {...partProps}
              texturesByMaterialType={texturesByMaterialType}
            />
          )
        }
        return null
      }),
    [dispatch, texturesByMaterialType],
  )

  return (
    <Canvas
      orthographic
      shadowMap
      colorManagement
      onPointerMissed={() => {
        console.log('deselect')
        dispatch(doSelectParts([]))
      }}
    >
      <GlProvider>
        <Camera />
        <Selector />
        <Background currentBeamWidth={currentBeamWidth} />
        <Clipboard />

        {renderParts(parts)}
      </GlProvider>
    </Canvas>
  )
}

interface BackgroundProps {
  currentBeamWidth: number
}

function Background(props: BackgroundProps) {
  const { currentBeamWidth } = props
  const numSmallFloorTiles = 256
  const largeFloorTileScale = 8
  const numLargeFloorTiles = numSmallFloorTiles / largeFloorTileScale
  const floorLength = numSmallFloorTiles * currentBeamWidth

  return (
    <>
      <ambientLight args={[0xffffff, 0.2]} />
      <hemisphereLight args={[0xffffff, 0x404040]} />
      // @ts-ignore
      <Sky sunPosition={[0, 1, 10]} />
      <spotLight args={[0xffffff]} position={[0, 1, 10]} castShadow />
      <axesHelper args={[floorLength]} position={[0, 0, 1e-3]} />
      <gridHelper
        args={[floorLength, numSmallFloorTiles, 0x444444, 0xdddddd]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <gridHelper
        args={[floorLength, numLargeFloorTiles, 0x444444, 0x888888]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh position={[0, 0, 0]} receiveShadow>
        <shadowMaterial attach="material" args={[{ opacity: 0.8 }]} />
        <planeBufferGeometry
          attach="geometry"
          args={[floorLength, floorLength]}
        />
      </mesh>
      <Scale />
    </>
  )
}

// https://github.com/react-spring/drei/blob/master/src/Sky.tsx

extend({ SkyImpl })

// @ts-ignore
type SkyImplProps = ReactThreeFiber.Object3DNode<SkyImpl, typeof SkyImpl>

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/interface-name-prefix
    interface IntrinsicElements {
      skyImpl: SkyImplProps
    }
  }
}

export interface SkyProps extends SkyImplProps {
  distance?: number
  sunPosition?: ReactThreeFiber.Vector3 | Array<number>
}

export const Sky = forwardRef<SkyProps>(
  (
    { distance = 45000, sunPosition = Object3D.DefaultUp, ...props }: SkyProps,
    ref,
  ) => {
    const scale = useMemo(() => new Vector3().setScalar(distance), [distance])

    return (
      <skyImpl
        ref={ref}
        material-uniforms-sunPosition-value={sunPosition}
        scale={scale}
        {...props}
      />
    )
  },
)
