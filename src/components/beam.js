const React = require('react')
const THREE = require('three')
const { map, multiply, prop } = require('ramda')

const useCameraStore = require('../stores/camera').default
const useSpecStore = require('../stores/spec')
const useSelectionStore = require('../stores/selection')
const { getBeamWidth } = require('../selectors/spec')

const rotationByDirection = {
  x: [0, 0, 0],
  y: [0, Math.PI / 2, 0],
  z: [0, 0, Math.PI / 2]
}

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
    move,
    material
  } = props

  const enableCameraControl = useCameraStore(state => state.enableControl)
  const disableCameraControl = useCameraStore(state => state.disableControl)
  const enableSelectionBox = useSelectionStore(prop('enable'))
  const disableSelectionBox = useSelectionStore(prop('disable'))
  const beamWidth = useSpecStore(getBeamWidth)

  const { direction, length, origin } = value

  const geometry = React.useMemo(() => {
    const boxSize = [beamWidth * length, beamWidth, beamWidth]
    var boxGeometry = new THREE.BoxBufferGeometry(...boxSize, length)

    // rotate
    const rotation = rotationByDirection[direction]
    boxGeometry.rotateX(rotation[0])
    boxGeometry.rotateY(rotation[1])
    boxGeometry.rotateZ(rotation[2])

    // translate so at (0, 0) facing positive values
    boxGeometry.computeBoundingBox()
    const { boundingBox } = boxGeometry
    boxGeometry.translate(
      -boundingBox.min.x,
      -boundingBox.min.y,
      -boundingBox.min.z
    )

    return boxGeometry
  }, [beamWidth, length, direction])

  const position = React.useMemo(() => map(multiply(beamWidth))(origin), [
    beamWidth,
    origin
  ])

  const [atMoveStart, setAtMoveStart] = React.useState(null)
  const handleMove = React.useCallback(ev => {
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
      .divideScalar(beamWidth)
      .round()

    const nextOrigin = new THREE.Vector3()
      .fromArray(originAtMoveStart)
      .add(beamMovementVector)

    const delta = new THREE.Vector3()
      .copy(nextOrigin)
      .sub(new THREE.Vector3().fromArray(value.origin))

    move(delta.toArray())
  }, [uuid, isSelected, value, atMoveStart, beamWidth])

  const handleHover = React.useCallback(ev => {
    ev.stopPropagation()
    // console.log('hover', uuid)
    hover()
  }, [uuid, hover])

  const handleUnhover = React.useCallback(ev => {
    ev.stopPropagation()
    // console.log('unhover', uuid)
    unhover()
  }, [uuid, unhover])

  const handleClick = React.useCallback(ev => {
    ev.stopPropagation()
    // console.log('click x', ev.detail)
    // if (ev.detail > 1) select()
  }, [uuid, select])

  const color = React.useMemo(() => {
    const value = isSelected ? 'pink' : isHovered ? 'red' : 'green'
    return new THREE.Color(value)
  }, [isSelected, isHovered])

  return (
    <mesh
      uuid={uuid}
      geometry={geometry}
      position={position}
      material={material}
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
    />
  )
}
