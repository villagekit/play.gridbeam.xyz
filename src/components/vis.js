import React from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from 'react-three-fiber'
import { map, pipe, prop, values } from 'ramda'
import { mapValues } from 'lodash'

import { GlProvider } from './provider'
import useModelStore from '../stores/model'
import useSpecStore from '../stores/spec'
import { selectParts } from '../selectors/parts'
import { getBeamWidth } from '../selectors/spec'

import Beam from './beam'
import Camera from './camera'
import Selector from './selection-gl'

const texturePathsByMaterialType = {
  wood: require('../textures/pine.jpg')
}

export default Vis

function Vis (props) {
  const parts = useModelStore(selectParts)
  const selects = useModelStore(prop('selects'))
  const spec = useSpecStore(prop('currentSpec'))
  const beamWidth = useSpecStore(getBeamWidth)

  const texturesByMaterialType = React.useMemo(() => {
    return mapValues(texturePathsByMaterialType, texturePath => {
      return new THREE.TextureLoader().load(texturePath)
    })
  }, [texturePathsByMaterialType])
  const beamTexture = React.useMemo(() => {
    return texturesByMaterialType[spec.beamMaterial]
  }, [spec.beamMaterial])

  const renderParts = React.useMemo(
    () =>
      map(part => {
        if (part.type === 'beam') {
          return <Beam key={part.uuid} {...part} texture={beamTexture} />
        }
        return null
      }),
    [parts, beamTexture]
  )

  return (
    <Canvas
      orthographic
      onPointerMissed={() => {
        selects([])
      }}
    >
      <GlProvider>
        <Camera />
        <Selector />
        <Background />

        {renderParts(parts)}
      </GlProvider>
    </Canvas>
  )
}

function Background () {
  const beamWidth = useSpecStore(getBeamWidth)
  const floorTiles = 128
  const floorLength = floorTiles * beamWidth

  const planeGeometry = React.useMemo(() => {
    var planeGeometry = new THREE.PlaneBufferGeometry(floorLength, floorLength)
    return planeGeometry
  }, [])

  const planeMaterial = React.useMemo(() => {
    return new THREE.ShadowMaterial({ opacity: 0.2 })
  }, [])

  const { scene, gl } = useThree()
  React.useEffect(() => {
    gl.shadowMap.enabled = true
  }, [])

  const spotLight = React.useMemo(() => {
    var light = new THREE.SpotLight(0xffffff, 0)
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
    </>
  )
}
