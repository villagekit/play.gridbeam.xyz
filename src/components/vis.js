const React = require('react')
const THREE = require('three')
const { Canvas, useResource } = require('react-three-fiber')
const { DEFAULT_BEAM_WIDTH } = require('gridbeam-csg')
const { map, pipe, prop, values } = require('ramda')

const useModelStore = require('../stores/model')
const { selectParts } = require('../selectors/parts')

const Beam = require('./beam')
const Camera = require('./camera')
const Selector = require('./selection-gl')

module.exports = Vis

function Vis (props) {
  const parts = useModelStore(selectParts)
  const selects = useModelStore(prop('selects'))

  const beamTexturePath = require('../textures/pine.jpg')
  const beamTexture = React.useMemo(() => {
    var texture = new THREE.TextureLoader().load(beamTexturePath)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
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
      <ambientLight args={[0xffffff, 0.2]} />
      <hemisphereLight args={[0xffffff, 0x404040]} />
      <Camera />
      <Selector />
      <axesHelper args={[1000]} />
      <gridHelper args={[1000, 1000 / DEFAULT_BEAM_WIDTH]} />

      {renderParts(parts)}
    </Canvas>
  )
}
