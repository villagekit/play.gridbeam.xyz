const React = require('react')
const THREE = require('three')
const csg = require('@jscad/csg')
const csgToMesh = require('csg-to-mesh')
const { map, multiply, prop } = require('ramda')

const BEAM_WIDTH = 10
const CYLINDER_RESOLUTION = 6
const HOLE_RADIUS = 2
const GridBeamCsg = require('gridbeam-csg')(csg, {
  cylinderResolution: CYLINDER_RESOLUTION,
  beamWidth: BEAM_WIDTH,
  holeRadius: HOLE_RADIUS
})

const useCameraStore = require('../stores/camera').default
const useSelectionStore = require('../stores/selection')

const Complex = require('./complex')

module.exports = Beam

function Beam (props) {
  const {
    uuid,
    value,
    isHovered,
    hover,
    unhover,
    isSelected,
    select,
    move
  } = props

  const enableCameraControl = useCameraStore(state => state.enableControl)
  const disableCameraControl = useCameraStore(state => state.disableControl)
  const enableSelectionBox = useSelectionStore(prop('enable'))
  const disableSelectionBox = useSelectionStore(prop('disable'))

  const mesh = React.useMemo(
    () => {
      const beam = {
        direction: value.direction,
        length: value.length,
        origin: [0, 0, 0]
      }
      return beamToMesh(beam)
    },
    [value.direction, value.length]
  )

  const position = React.useMemo(
    () => map(multiply(BEAM_WIDTH))(value.origin),
    [value.origin]
  )

  const [atMoveStart, setAtMoveStart] = React.useState(null)
  const handleMove = React.useCallback(
    ev => {
      ev.stopPropagation()
      if (ev.buttons <= 0) return
      if (atMoveStart == null) return

      const [pointAtMoveStart, originAtMoveStart] = atMoveStart
      var intersectionPoint = new THREE.Vector3()
      var movementVector

      if (ev.shiftKey) {
        // TODO is this correct?
        const verticalPlane = new THREE.Plane(
          new THREE.Vector3(1, 0, 0),
          -pointAtMoveStart.x
        )
        ev.ray.intersectPlane(verticalPlane, intersectionPoint)
        movementVector = new THREE.Vector3(
          0,
          intersectionPoint.y - pointAtMoveStart.y,
          0
        )
      } else {
        const horizontalPlane = new THREE.Plane(
          new THREE.Vector3(0, 1, 0),
          -pointAtMoveStart.y
        )
        ev.ray.intersectPlane(horizontalPlane, intersectionPoint)
        movementVector = new THREE.Vector3()
          .copy(intersectionPoint)
          .sub(pointAtMoveStart)
      }

      const beamMovementVector = new THREE.Vector3()
        .copy(movementVector)
        .divideScalar(BEAM_WIDTH)
        .round()

      const nextOrigin = new THREE.Vector3()
        .fromArray(originAtMoveStart)
        .add(beamMovementVector)

      const delta = new THREE.Vector3()
        .copy(nextOrigin)
        .sub(new THREE.Vector3().fromArray(value.origin))

      move(delta.toArray())
    },
    [uuid, isSelected, value, atMoveStart]
  )

  const handleHover = React.useCallback(
    ev => {
      ev.stopPropagation()
      // console.log('hover', uuid)
      hover()
    },
    [uuid, hover]
  )

  const handleUnhover = React.useCallback(
    ev => {
      ev.stopPropagation()
      // console.log('unhover', uuid)
      unhover()
    },
    [uuid, unhover]
  )

  const handleClick = React.useCallback(
    ev => {
      ev.stopPropagation()
      // console.log('click x', ev.detail)
      // if (ev.detail > 1) select()
    },
    [uuid, select]
  )

  const color = React.useMemo(
    () => {
      const value = isSelected ? 'pink' : isHovered ? 'red' : 'green'
      return new THREE.Color(value)
    },
    [isSelected, isHovered]
  )

  return (
    <mesh
      uuid={uuid}
      position={position}
      onClick={handleClick}
      onPointerDown={ev => {
        ev.stopPropagation()
        ev.target.setPointerCapture(ev.pointerId)
        disableCameraControl()
        disableSelectionBox()
        if (!isSelected) select()
        setAtMoveStart([ev.point, value.origin])
      }}
      onPointerUp={ev => {
        ev.stopPropagation()
        ev.target.releasePointerCapture(ev.pointerId)
        enableCameraControl()
        enableSelectionBox()
        setAtMoveStart(null)
      }}
      onPointerMove={handleMove}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
    >
      <Complex mesh={mesh} attach='geometry' />
      <meshLambertMaterial attach='material' color={color} />
    </mesh>
  )
}

function beamToMesh (beam) {
  const csg = GridBeamCsg.Beam(beam, { renderHoles: false })
  return csgToMesh(csg)
}
