const React = require('react')
const THREE = require('three')
const { Canvas, useThree } = require('react-three-fiber')
const { map, pipe, prop, values } = require('ramda')

const useModelStore = require('../stores/model')
const useSpecStore = require('../stores/spec')
const { selectParts } = require('../selectors/parts')
const { getBeamWidth } = require('../selectors/spec')

const Beam = require('./beam')
const Camera = require('./camera')
const Selector = require('./selection-gl')

const texturesByMaterial = {
  wood: require('../textures/pine.jpg')
}

module.exports = Vis

function Vis (props) {
  const parts = useModelStore(selectParts)
  const selects = useModelStore(prop('selects'))
  const spec = useSpecStore(prop('currentSpec'))
  const beamWidth = useSpecStore(getBeamWidth)

  const beamTexturePath = React.useMemo(() => {
    return texturesByMaterial[spec.beamMaterial]
  }, [spec.beamMaterial])
  const beamTexture = React.useMemo(() => {
    var texture = new THREE.TextureLoader().load(beamTexturePath)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [beamTexturePath])
  const beamMaterial = React.useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0x000000,
        map: beamTexture
      }),
    [beamTexture]
  )

  const renderParts = React.useMemo(
    () =>
      map(part => {
        if (part.type === 'beam') {
          return <Beam key={part.uuid} {...part} material={beamMaterial} />
        }
        return null
      }),
    [parts, beamMaterial]
  )

  return (
    <Canvas
      orthographic
      onPointerMissed={() => {
        selects([])
      }}
    >
      <Camera />
      <Selector />
      <Background />

      {renderParts(parts)}
    </Canvas>
  )
}

function Background () {
  const beamWidth = useSpecStore(getBeamWidth)
  const floorTiles = 256
  const floorLength = floorTiles * beamWidth

  const planeGeometry = React.useMemo(() => {
    var planeGeometry = new THREE.PlaneBufferGeometry(floorLength, floorLength)
    planeGeometry.rotateX(-Math.PI / 2)
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
    light.position.set(0, 3000, 300)
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
      <axesHelper args={[1000]} />
      <gridHelper args={[floorLength, floorTiles]} />
      <mesh
        position={[0, 0, 0]}
        geometry={planeGeometry}
        material={planeMaterial}
        receiveShadow
      />
    </>
  )
}
