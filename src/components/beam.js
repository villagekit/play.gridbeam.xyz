const React = require('react')
const THREE = require('three')
const { map, multiply, prop, range } = require('ramda')
const { useResource } = require('react-three-fiber')

const useCameraStore = require('../stores/camera').default
const useSpecStore = require('../stores/spec')
const useSelectionStore = require('../stores/selection')
const { getBeamWidth, getHoleDiameter } = require('../selectors/spec')

const rotationByDirection = {
  x: { inclination: 0, azimuth: 0 },
  y: { inclination: Math.PI / 2, azimuth: 0 },
  z: { inclination: 0, azimuth: -Math.PI / 2 }
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
    texture
  } = props

  const enableCameraControl = useCameraStore(state => state.enableControl)
  const disableCameraControl = useCameraStore(state => state.disableControl)
  const enableSelectionBox = useSelectionStore(prop('enable'))
  const disableSelectionBox = useSelectionStore(prop('disable'))
  const beamWidth = useSpecStore(getBeamWidth)
  const holeDiameter = useSpecStore(getHoleDiameter)

  const { direction, length, origin } = value

  const rotation =
    typeof direction === 'string' ? rotationByDirection[direction] : direction

  console.log('rotation', uuid, rotation)

  const geometry = React.useMemo(() => {
    const boxSize = [beamWidth * length, beamWidth, beamWidth]
    var boxGeometry = new THREE.BoxGeometry(...boxSize, length)

    // translate beam so first hole is at (0, 0).
    // this way, the first hole is preserved across rotations.
    boxGeometry.translate((beamWidth * (length - 1)) / 2, 0, 0)

    return boxGeometry
  }, [beamWidth, length])

  const position = React.useMemo(() => {
    const originPosition = map(multiply(beamWidth))(origin)
    return [
      originPosition[0] + beamWidth / 2,
      originPosition[1] + beamWidth / 2,
      originPosition[2] + beamWidth / 2
    ]
  }, [beamWidth, origin, rotation])
  /*
  const position = React.useMemo(() => {
    const originPosition = map(multiply(beamWidth))(origin)
    return [
      originPosition[0] +
        (beamWidth / 2) *
          Math.sin(rotation.inclination) *
          Math.cos(rotation.azimuth),
      originPosition[1] +
        (beamWidth / 2) *
          Math.sin(rotation.inclination) *
          Math.sin(rotation.azimuth),
      originPosition[2] + (beamWidth / 2) * Math.cos(rotation.azimuth)
    ]
  }, [beamWidth, origin, rotation])
  */

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
        0,
        intersectionPoint.z - pointAtMoveStart.z
      )
    } else {
      const horizontalPlane = new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        -pointAtMoveStart.z
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
    const value = isSelected ? 'cyan' : isHovered ? 'magenta' : 'white'
    return new THREE.Color(value)
  }, [isSelected, isHovered])

  const material = React.useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color,
        map: texture
      }),
    [texture, color]
  )

  return (
    <group
      uuid={uuid}
      position={position}
      rotation={[0, rotation.azimuth, rotation.inclination]}
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
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      <Holes
        numHoles={value.length}
        beamWidth={beamWidth}
        holeDiameter={holeDiameter}
      />
    </group>
  )
}

const HOLE_SEGMENTS = 8

function Holes (props) {
  const { numHoles, beamWidth, holeDiameter } = props
  const holeRadius = holeDiameter / 2

  const [materialRef, material] = useResource()
  const [geometryRef, geometry] = useResource()

  return (
    <group>
      <meshBasicMaterial ref={materialRef} color='black' />
      <circleGeometry ref={geometryRef} args={[holeRadius, HOLE_SEGMENTS]} />
      {range(0, numHoles).map(index => (
        <>
          // top
          <mesh
            key={`hole-${index}-top`}
            material={material}
            geometry={geometry}
            rotation={[0, 0, 0]}
            position={[index * beamWidth, 0, 0.01 + (1 / 2) * beamWidth]}
          />
          // bottom
          <mesh
            key={`hole-${index}-bottom`}
            material={material}
            geometry={geometry}
            rotation={[Math.PI, 0, 0]}
            position={[index * beamWidth, 0, -0.01 - (1 / 2) * beamWidth]}
          />
          // left
          <mesh
            key={`hole-${index}-left`}
            material={material}
            geometry={geometry}
            rotation={[(3 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, 0.01 + (1 / 2) * beamWidth, 0]}
          />
          // right
          <mesh
            key={`hole-${index}-right`}
            material={material}
            geometry={geometry}
            rotation={[(1 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, -0.01 - (1 / 2) * beamWidth, 0]}
          />
        </>
      ))}
    </group>
  )
}
