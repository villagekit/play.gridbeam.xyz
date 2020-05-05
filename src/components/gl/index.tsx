import { mapValues } from 'lodash'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Canvas, useThree } from 'react-three-fiber'
import {
  PlaneBufferGeometry,
  ShadowMaterial,
  SpotLight,
  Texture,
  TextureLoader,
} from 'three'

import Codec from '../../codec'
import {
  doHoverPart,
  doSelectParts,
  doUnhoverPart,
  doUpdateSelectedParts,
  getCurrentSpecSize,
  getParts,
  MaterialId,
  PartValue,
} from '../../store'
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
        if (part.type === Codec.PartType.Beam) {
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
      onPointerMissed={() => {
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

  const planeGeometry = React.useMemo(() => {
    const planeGeometry = new PlaneBufferGeometry(floorLength, floorLength)
    return planeGeometry
  }, [floorLength])

  const planeMaterial = React.useMemo(() => {
    return new ShadowMaterial({ opacity: 0.2 })
  }, [])

  const { scene, gl } = useThree()
  React.useEffect(() => {
    gl.shadowMap.enabled = true
  }, [gl.shadowMap.enabled])

  const spotLight = React.useMemo(() => {
    const light = new SpotLight(0xffffff, 0)
    light.position.set(0, 300, 3000)
    light.castShadow = true
    light.shadow.camera.far = 100000
    light.shadow.camera.position.set(0, 0, 10000)
    return light
  }, [])

  React.useEffect(() => {
    scene.add(spotLight)
  }, [scene, spotLight])

  return (
    <>
      <ambientLight args={[0xffffff, 0.2]} />
      <hemisphereLight args={[0xffffff, 0x404040]} />
      <axesHelper args={[floorLength]} position={[0, 0, 0.01]} />
      <gridHelper
        args={[floorLength, numSmallFloorTiles, 0x444444, 0xdddddd]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <gridHelper
        args={[floorLength, numLargeFloorTiles, 0x444444, 0x888888]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh
        position={[0, 0, 0]}
        geometry={planeGeometry}
        material={planeMaterial}
        receiveShadow
      />
      <Scale />
    </>
  )
}
