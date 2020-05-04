import { mapValues } from 'lodash'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Canvas, useThree } from 'react-three-fiber'
import {
  PlaneBufferGeometry,
  ShadowMaterial,
  SpotLight,
  TextureLoader,
} from 'three'

import Codec from '../codec'
import {
  doHoverPart,
  doSelectParts,
  doUnhoverPart,
  doUpdateSelectedParts,
  getCurrentSpecSize,
  getParts,
} from '../store'
import Beam from './beam'
import Camera from './camera'
import Clipboard from './clipboard'
import { GlProvider } from './provider'
import Scale from './scale'
import Selector from './selection-gl'

const texturePathsByMaterialType = {
  [Codec.MaterialId.Wood]: require('../textures/pine.jpg'),
}

export default Vis

function Vis(props) {
  const dispatch = useDispatch()

  const parts = useSelector(getParts)

  const currentSize = useSelector(getCurrentSpecSize)
  const currentBeamWidth = currentSize.normalizedBeamWidth

  const texturesByMaterialType = React.useMemo(() => {
    return mapValues(texturePathsByMaterialType, (texturePath) => {
      return new TextureLoader().load(texturePath)
    })
  }, [])

  const renderParts = useCallback(
    (parts) =>
      parts.map((part) => {
        const { uuid } = part
        const partProps = {
          ...part,
          hover: () => dispatch(doHoverPart(uuid)),
          unhover: () => dispatch(doUnhoverPart(uuid)),
          select: () => dispatch(doSelectParts([uuid])),
          move: (delta) =>
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

function Background(props) {
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
