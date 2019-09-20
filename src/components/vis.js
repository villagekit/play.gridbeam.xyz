import React from 'react'
import { useStore, useSelector } from 'react-redux'
import {
  TextureLoader,
  PlaneBufferGeometry,
  ShadowMaterial,
  SpotLight
} from 'three'
import { Canvas, useThree } from 'react-three-fiber'
import { map } from 'ramda'

import { GlProvider } from './provider'
import Beam from './beam'
import Camera from './camera'
import Scale from './scale'
import Selector from './selection-gl'
import Clipboard from './clipboard'

const texturePathsByMaterialType = {
  wood: require('../textures/pine.jpg')
}

export default Vis

function Vis (props) {
  const { select, dispatch } = useStore()

  const parts = useSelector(select.parts.all)

  const currentBeamMaterial = useSelector(select.spec.currentBeamMaterial)
  const currentBeamWidth = useSelector(select.spec.currentBeamWidth)

  const texturesByMaterialType = React.useMemo(() => {
    return map(texturePath => {
      return new TextureLoader().load(texturePath)
    }, texturePathsByMaterialType)
  }, [texturePathsByMaterialType])
  const beamTexture = React.useMemo(() => {
    return texturesByMaterialType[currentBeamMaterial]
  }, [currentBeamMaterial])

  const renderParts = React.useMemo(
    () =>
      map(part => {
        const { uuid } = part
        const partProps = {
          ...part,
          hover: () => dispatch.parts.hover(uuid),
          unhover: () => dispatch.parts.unhover(uuid),
          select: () => dispatch.parts.selects([uuid]),
          move: delta =>
            dispatch.parts.updateSelected(part => {
              part.origin[0] += delta[0]
              part.origin[1] += delta[1]
              part.origin[2] += delta[2]
            })
        }
        if (part.type === 'beam') {
          return <Beam key={part.uuid} {...partProps} texture={beamTexture} />
        }
        return null
      }),
    [parts, beamTexture]
  )

  return (
    <Canvas
      orthographic
      onPointerMissed={() => {
        dispatch.parts.selects([])
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

function Background (props) {
  const { currentBeamWidth } = props
  const floorTiles = 128
  const floorLength = floorTiles * currentBeamWidth

  const planeGeometry = React.useMemo(() => {
    var planeGeometry = new PlaneBufferGeometry(floorLength, floorLength)
    return planeGeometry
  }, [])

  const planeMaterial = React.useMemo(() => {
    return new ShadowMaterial({ opacity: 0.2 })
  }, [])

  const { scene, gl } = useThree()
  React.useEffect(() => {
    gl.shadowMap.enabled = true
  }, [])

  const spotLight = React.useMemo(() => {
    var light = new SpotLight(0xffffff, 0)
    light.position.set(0, 300, 3000)
    light.castShadow = true
    light.shadow.camera.far = 100000
    light.shadow.camera.position.set(0, 0, 10000)
    return light
  }, [])

  React.useEffect(() => {
    scene.add(spotLight)
  }, [])

  return (
    <>
      <ambientLight args={[0xffffff, 0.2]} />
      <hemisphereLight args={[0xffffff, 0x404040]} />
      <axesHelper args={[floorLength]} position={[0, 0, 0.01]} />
      <gridHelper
        args={[floorLength, floorTiles]}
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
