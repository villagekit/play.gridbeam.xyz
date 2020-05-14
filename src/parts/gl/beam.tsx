import { range } from 'lodash'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useResource } from 'react-three-fiber'
import {
  Direction,
  directionToRotation,
  doDisableCameraControl,
  doDisableSelection,
  doEnableCameraControl,
  doEnableSelection,
  doSetAnyPartIsMoving,
  getCurrentSpecMaterials,
  getCurrentSpecSizes,
  GridPosition,
  PartValue,
  TexturesByMaterialType,
  Uuid,
} from 'src'
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  MeshBasicMaterial,
  Plane,
  RingGeometry,
  Vector3,
} from 'three'

interface BeamProps {
  uuid: Uuid
  origin: PartValue['origin']
  direction: Direction
  length: PartValue['length']
  isHovered: PartValue['isHovered']
  hover: () => void
  unhover: () => void
  isSelected: PartValue['isSelected']
  select: () => void
  move: (movement: [number, number, number]) => void
  sizeId: PartValue['sizeId']
  materialId: PartValue['materialId']
  texturesByMaterialType: TexturesByMaterialType
}

export function GlBeam(props: BeamProps) {
  const {
    uuid,
    origin,
    direction,
    length,
    isHovered,
    hover,
    unhover,
    isSelected,
    select,
    move,
    sizeId,
    materialId,
    texturesByMaterialType,
  } = props

  const dispatch = useDispatch()

  const currentSpecSizes = useSelector(getCurrentSpecSizes)
  const currentSpecMaterials = useSelector(getCurrentSpecMaterials)

  const beamSpecSize = currentSpecSizes[sizeId]
  const beamSpecMaterial = currentSpecMaterials[materialId]
  const beamSpecMaterialSize = beamSpecMaterial.sizes[sizeId]

  const beamWidth = beamSpecSize.normalizedBeamWidth
  const holeDiameter = beamSpecMaterialSize.normalizedHoleDiameter

  const beamTexture = React.useMemo(() => {
    return texturesByMaterialType[beamSpecMaterial.id]
  }, [beamSpecMaterial.id, texturesByMaterialType])

  const geometry = React.useMemo(() => {
    const boxSize = [beamWidth * length, beamWidth, beamWidth]
    const boxGeometry = new BoxGeometry(...boxSize, length)

    // translate beam so first hole is at (0, 0).
    // this way, the first hole is preserved across rotations.
    boxGeometry.translate((beamWidth * (length - 1)) / 2, 0, 0)

    return boxGeometry
  }, [beamWidth, length])

  const position: [number, number, number] = React.useMemo(() => {
    return [
      (1 / 2 + origin.x) * beamWidth,
      (1 / 2 + origin.y) * beamWidth,
      (1 / 2 + origin.z) * beamWidth,
    ]
  }, [beamWidth, origin])

  const [atMoveStart, setAtMoveStart] = React.useState<
    [Vector3, GridPosition] | null
  >(null)
  const handleMove = React.useCallback(
    (ev) => {
      // console.log('move', uuid)
      if (ev.buttons <= 0) return
      if (atMoveStart == null) return

      const [pointAtMoveStart, originAtMoveStart] = atMoveStart
      const intersectionPoint = new Vector3()
      let movementVector

      if (ev.shiftKey) {
        // TODO is this correct?
        const verticalPlane = new Plane(
          new Vector3(1, 0, 0),
          -pointAtMoveStart.x,
        )
        ev.ray.intersectPlane(verticalPlane, intersectionPoint)
        movementVector = new Vector3(
          0,
          0,
          intersectionPoint.z - pointAtMoveStart.z,
        )
      } else {
        const horizontalPlane = new Plane(
          new Vector3(0, 0, 1),
          -pointAtMoveStart.z,
        )
        ev.ray.intersectPlane(horizontalPlane, intersectionPoint)
        movementVector = new Vector3()
          .copy(intersectionPoint)
          .sub(pointAtMoveStart)
      }

      const beamMovementVector = new Vector3()
        .copy(movementVector)
        .divideScalar(beamWidth)
        .round()

      const nextOrigin = new Vector3(
        originAtMoveStart.x,
        originAtMoveStart.y,
        originAtMoveStart.z,
      ).add(beamMovementVector)

      const delta = new Vector3()
        .copy(nextOrigin)
        .sub(new Vector3(origin.x, origin.y, origin.z))

      move([delta.x, delta.y, delta.z])
    },
    [atMoveStart, beamWidth, origin.x, origin.y, origin.z, move],
  )

  const handleHover = React.useCallback(
    (ev) => {
      // console.log('hover', uuid)
      hover()
    },
    [hover],
  )

  const handleUnhover = React.useCallback(
    (ev) => {
      // console.log('unhover', uuid)
      unhover()
    },
    [unhover],
  )

  const handleClick = React.useCallback((ev) => {
    ev.stopPropagation()
    // console.log('click x', ev.detail)
  }, [])

  const handlePointerDown = React.useCallback(
    (ev) => {
      ev.stopPropagation()
      // @ts-ignore
      ev.target.setPointerCapture(ev.pointerId)
      dispatch(doDisableCameraControl())
      dispatch(doDisableSelection())
      dispatch(doSetAnyPartIsMoving(true))
      if (!isSelected) select()
      setAtMoveStart([ev.point, origin])
    },
    [dispatch, origin, isSelected, select, setAtMoveStart],
  )

  const handlePointerUp = React.useCallback(
    (ev) => {
      ev.stopPropagation()
      // @ts-ignore
      ev.target.releasePointerCapture(ev.pointerId)
      dispatch(doEnableCameraControl())
      dispatch(doEnableSelection())
      dispatch(doSetAnyPartIsMoving(false))
      setAtMoveStart(null)
    },
    [dispatch],
  )

  const color = React.useMemo(() => {
    return new Color(isSelected ? 'cyan' : isHovered ? 'magenta' : 'white')
  }, [isSelected, isHovered])

  const rotation = React.useMemo(() => {
    return directionToRotation(direction)
  }, [direction])

  return (
    <group
      name={uuid}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handleMove}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
    >
      <group>
        <mesh uuid={uuid} geometry={geometry} castShadow>
          <meshLambertMaterial attach="material" color={color}>
            <primitive object={beamTexture} attach="map" />
          </meshLambertMaterial>
        </mesh>
        <mesh geometry={geometry} receiveShadow>
          <shadowMaterial attach="material" />
        </mesh>
      </group>
      <Holes
        numHoles={length}
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

interface HolesProps {
  numHoles: number
  beamWidth: number
  holeDiameter: number
}

function Holes(props: HolesProps) {
  const { numHoles, beamWidth, holeDiameter } = props
  const holeRadius = holeDiameter / 2

  const [materialRef, material] = useResource<MeshBasicMaterial>()
  const [geometryRef, geometry] = useResource<CircleGeometry>()

  return (
    <group>
      <meshBasicMaterial ref={materialRef} color="black" />
      <circleGeometry ref={geometryRef} args={[holeRadius, HOLE_SEGMENTS]} />
      {range(0, numHoles).map((index) => (
        <React.Fragment key={index}>
          {/* top */}
          <mesh
            material={material}
            geometry={geometry}
            rotation={[0, 0, 0]}
            position={[index * beamWidth, 0, 1e-5 + (1 / 2) * beamWidth]}
          />
          {/* bottom */}
          <mesh
            material={material}
            geometry={geometry}
            rotation={[Math.PI, 0, 0]}
            position={[index * beamWidth, 0, -1e-5 - (1 / 2) * beamWidth]}
          />
          {/* left */}
          <mesh
            material={material}
            geometry={geometry}
            rotation={[(3 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, 1e-5 + (1 / 2) * beamWidth, 0]}
          />
          {/* right */}
          <mesh
            material={material}
            geometry={geometry}
            rotation={[(1 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, -1e-6 - (1 / 2) * beamWidth, 0]}
          />
        </React.Fragment>
      ))}
    </group>
  )
}

interface FirstHoleMarkerProps {
  beamWidth: number
  holeDiameter: number
}

function FirstHoleMarker(props: FirstHoleMarkerProps) {
  const { beamWidth, holeDiameter } = props
  const holeRadius = holeDiameter / 2
  const innerRadius = holeRadius
  const outerRadius = holeRadius * 2

  const [materialRef, material] = useResource<MeshBasicMaterial>()
  const [geometryRef, geometry] = useResource<RingGeometry>()

  return (
    <group>
      <meshBasicMaterial ref={materialRef} color="magenta" />
      <ringGeometry ref={geometryRef} args={[innerRadius, outerRadius]} />
      {/* top */}
      <mesh
        material={material}
        geometry={geometry}
        rotation={[0, 0, 0]}
        position={[0, 0, 2e-5 + (1 / 2) * beamWidth]}
      />
      {/* bottom */}
      <mesh
        material={material}
        geometry={geometry}
        rotation={[Math.PI, 0, 0]}
        position={[0, 0, -2e-5 - (1 / 2) * beamWidth]}
      />
      {/* left */}
      <mesh
        material={material}
        geometry={geometry}
        rotation={[-(1 / 2) * Math.PI, 0, 0]}
        position={[0, 2e-5 + (1 / 2) * beamWidth, 0]}
      />
      {/* right */}
      <mesh
        material={material}
        geometry={geometry}
        rotation={[(1 / 2) * Math.PI, 0, 0]}
        position={[0, -2e-5 - (1 / 2) * beamWidth, 0]}
      />
    </group>
  )
}
