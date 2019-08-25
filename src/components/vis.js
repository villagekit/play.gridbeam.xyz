const React = require('react')
const THREE = require('three')
const { Canvas } = require('react-three-fiber')
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

  const renderParts = React.useMemo(
    () =>
      map(part => {
        const Part = PART_TYPES[part.type]
        return <Part key={part.uuid} {...part} />
      }),
    [parts]
  )

  return (
    <Canvas
      orthographic
      onPointerMissed={() => {
        selects([])
      }}
    >
      <hemisphereLight args={[0xffffbb, 0x080820]} />
      <Camera />
      <Selector />
      <axesHelper args={[1000]} />
      <gridHelper args={[1000, 1000 / DEFAULT_BEAM_WIDTH]} />
      {renderParts(parts)}
    </Canvas>
  )
}

const PART_TYPES = {
  beam: Beam
}
