const React = require('react')
const { useStore } = require('react-redux')
const THREE = require('three')
const { map, multiply, prop, range } = require('ramda')
const { useResource } = require('react-three-fiber')

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

  const { dispatch } = useStore()

  const enableSelectionBox = useSelectionStore(prop('enable'))
  const disableSelectionBox = useSelectionStore(prop('disable'))
  const beamWidth = useSpecStore(getBeamWidth)
  const holeDiameter = useSpecStore(getHoleDiameter)

  const { direction, length, origin } = value

  const rotation =
    typeof direction === 'string' ? rotationByDirection[direction] : direction

  const geometry = React.useMemo(() => {
    const boxSize = [beamWidth * length, beamWidth, beamWidth]
    var boxGeometry = new THREE.BoxGeometry(...boxSize, length)

    // translate beam so first hole is at (0, 0).
    // this way, the first hole is preserved across rotations.
    boxGeometry.translate((beamWidth * (length - 1)) / 2, 0, 0)

    return boxGeometry
  }, [beamWidth, length])

  const position = React.useMemo(() => {
    return [
      (1 / 2 + origin[0]) * beamWidth,
      (1 / 2 + origin[1]) * beamWidth,
      (1 / 2 + origin[2]) * beamWidth
    ]
  }, [beamWidth, origin])

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

  return (
    <group
      position={position}
      rotation={[0, rotation.azimuth, rotation.inclination]}
      onClick={handleClick}
      onPointerDown={ev => {
        ev.stopPropagation()
        ev.target.setPointerCapture(ev.pointerId)
        dispatch.camera.disableControl()
        disableSelectionBox()
        if (!isSelected) select()
        setAtMoveStart([ev.point, value.origin])
      }}
      onPointerUp={ev => {
        ev.stopPropagation()
        ev.target.releasePointerCapture(ev.pointerId)
        dispatch.camera.enableControl()
        enableSelectionBox()
        setAtMoveStart(null)
      }}
      onPointerMove={handleMove}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
    >
      <mesh uuid={uuid} geometry={geometry} castShadow receiveShadow>
        <meshLambertMaterial attach='material' color={color}>
          <primitive object={texture} attach='map' />
        </meshLambertMaterial>
      </mesh>
      <Holes
        numHoles={value.length}
        beamWidth={beamWidth}
        holeDiameter={holeDiameter}
      />
      {isSelected && (
        <FirstHoleMarker beamWidth={beamWidth} holeDiameter={holeDiameter} />
      )}
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
        <React.Fragment key={index}>
          // top
          <mesh
            material={material}
            geometry={geometry}
            rotation={[0, 0, 0]}
            position={[index * beamWidth, 0, 0.01 + (1 / 2) * beamWidth]}
          />
          // bottom
          <mesh
            material={material}
            geometry={geometry}
            rotation={[Math.PI, 0, 0]}
            position={[index * beamWidth, 0, -0.01 - (1 / 2) * beamWidth]}
          />
          // left
          <mesh
            material={material}
            geometry={geometry}
            rotation={[(3 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, 0.01 + (1 / 2) * beamWidth, 0]}
          />
          // right
          <mesh
            material={material}
            geometry={geometry}
            rotation={[(1 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, -0.01 - (1 / 2) * beamWidth, 0]}
          />
        </React.Fragment>
      ))}
    </group>
  )
}

const HOLE_MARKER_RADIALS = 16
const HOLE_MARKER_CIRCLES = 8
const HOLE_MARKER_DIVISIONS = 8
const HOLE_MARKER_COLOR1 = 'white'
const HOLE_MARKER_COLOR2 = 'magenta'

function FirstHoleMarker (props) {
  const { beamWidth, holeDiameter } = props
  return (
    <group>
      // top
      <HoleMarker
        rotation={[-(1 / 2) * Math.PI, 0, 0]}
        position={[0, 0, 0.02 + (1 / 2) * beamWidth]}
        holeDiameter={holeDiameter}
      />
      <HoleMarker
        // bottom
        rotation={[(1 / 2) * Math.PI, 0, 0]}
        position={[0, 0, -0.02 - (1 / 2) * beamWidth]}
        holeDiameter={holeDiameter}
      />
      // left
      <HoleMarker
        rotation={[Math.PI, 0, 0]}
        position={[0, 0.02 + (1 / 2) * beamWidth, 0]}
        holeDiameter={holeDiameter}
      />
      // right
      <HoleMarker
        rotation={[0, 0, 0]}
        position={[0, -0.02 - (1 / 2) * beamWidth, 0]}
        holeDiameter={holeDiameter}
      />
    </group>
  )
}

function HoleMarker (props) {
  const { holeDiameter, ...forwardedProps } = props
  const holeRadius = holeDiameter / 2
  const holeMarkerRadius = holeRadius * 2

  return (
    <polarGridHelper
      args={[
        holeMarkerRadius,
        HOLE_MARKER_RADIALS,
        HOLE_MARKER_CIRCLES,
        HOLE_MARKER_DIVISIONS,
        HOLE_MARKER_COLOR1,
        HOLE_MARKER_COLOR2
      ]}
      {...forwardedProps}
    />
  )
}
