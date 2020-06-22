import { range } from 'lodash'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { PointerEvent, useFrame, useResource } from 'react-three-fiber'
import {
  getPartsByUuid,
  GlArrow,
  isStandardDirection,
  LengthDirection,
  NEGATIVE_X_AXIS,
  PartValue,
  ROTATION,
  useAppStore,
  usePartActions,
  Uuid,
  X_AXIS,
} from 'src'
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  MeshBasicMaterial,
  Object3D,
  Plane,
  RingGeometry,
  Texture,
  Vector3,
} from 'three'

interface BeamProps {
  part: PartValue
  texture: Texture
}

export function GlBeam(props: BeamProps) {
  const { part, texture: beamTexture } = props

  const {
    uuid,
    direction,
    length,
    isHovered,
    isSelected,
    beamWidth,
    holeDiameter,
  } = part

  const {
    hover,
    unhover,
    select,
    startMoveTransition,
    updateMoveTransition,
    endMoveTransition,
    startLengthTransition,
    updateLengthTransition,
    endLengthTransition,
  } = usePartActions(uuid)

  // update position and quaternion outside of React
  const store = useAppStore()
  const beamRef = useRef<typeof Group>()
  useFrame(() => {
    if (beamRef.current == null) return
    const partsByUuid = getPartsByUuid(store.getState())
    // @ts-ignore
    const part = partsByUuid[uuid] as PartValue
    const { position, quaternion } = part
    // @ts-ignore
    const obj3d = beamRef.current as Object3D
    obj3d.position.x = position[0]
    obj3d.position.y = position[1]
    obj3d.position.z = position[2]
    obj3d.quaternion.copy(quaternion)
  })

  return (
    <group name="beam" ref={beamRef}>
      <BeamMain
        uuid={uuid}
        length={length}
        hover={hover}
        unhover={unhover}
        isHovered={isHovered}
        select={select}
        isSelected={isSelected}
        startMoveTransition={startMoveTransition}
        updateMoveTransition={updateMoveTransition}
        endMoveTransition={endMoveTransition}
        beamWidth={beamWidth}
        beamTexture={beamTexture}
      >
        <Holes
          numHoles={length}
          beamWidth={beamWidth}
          holeDiameter={holeDiameter}
        />
        {isSelected && (
          <FirstHoleMarker beamWidth={beamWidth} holeDiameter={holeDiameter} />
        )}
      </BeamMain>
      {[LengthDirection.positive, LengthDirection.negative].map(
        (lengthDirection) => (
          <LengthArrow
            key={lengthDirection}
            lengthDirection={lengthDirection}
            beamDirection={direction}
            beamWidth={beamWidth}
            beamLength={length}
            isSelected={isSelected}
            select={select}
            startLengthTransition={startLengthTransition}
            updateLengthTransition={updateLengthTransition}
            endLengthTransition={endLengthTransition}
          />
        ),
      )}
    </group>
  )
}

interface BeamMainProps {
  uuid: Uuid
  length: PartValue['length']
  hover: () => void
  unhover: () => void
  isHovered: PartValue['isHovered']
  select: () => void
  isSelected: PartValue['isSelected']
  beamWidth: number
  beamTexture: Texture
  startMoveTransition: () => void
  updateMoveTransition: (delta: [number, number, number]) => void
  endMoveTransition: () => void
  children: React.ReactNode
}

function BeamMain(props: BeamMainProps) {
  const {
    uuid,
    length,
    hover,
    unhover,
    isHovered,
    select,
    isSelected,
    beamWidth,
    beamTexture,
    startMoveTransition,
    updateMoveTransition,
    endMoveTransition,
    children,
  } = props

  const geometry = useMemo(() => {
    const boxSize = [beamWidth * length, beamWidth, beamWidth]
    const boxGeometry = new BoxGeometry(...boxSize, length)
    // translate beam so first hole is at (0, 0).
    // this way, the first hole is preserved across rotations.
    boxGeometry.translate((beamWidth * (length - 1)) / 2, 0, 0)

    return boxGeometry
  }, [beamWidth, length])

  const [pointAtMoveStart, setPointAtMoveStart] = useState<Vector3 | null>(null)

  const horizontalPlane = useMemo(() => {
    if (pointAtMoveStart == null) return null
    return new Plane(new Vector3(0, 0, 1), -pointAtMoveStart.z)
  }, [pointAtMoveStart])
  const verticalPlane = useMemo(() => {
    if (pointAtMoveStart == null) return null
    return new Plane(new Vector3(1, 0, 0), -pointAtMoveStart.x)
  }, [pointAtMoveStart])

  // computation vectors to re-use
  const intersectionPoint: Vector3 = useMemo(() => new Vector3(), [])
  const movementVector: Vector3 = useMemo(() => new Vector3(), [])

  const handleMove = useCallback(
    (ev) => {
      // console.log('move', uuid)
      if (ev.buttons <= 0) return
      if (pointAtMoveStart == null) return

      // get pointer movement over plane
      if (ev.shiftKey) {
        ev.ray.intersectPlane(verticalPlane, intersectionPoint)
        // intersection point cannot go below z = 0
        if (intersectionPoint.z < 0) intersectionPoint.z = 0
        movementVector.set(0, 0, intersectionPoint.z - pointAtMoveStart.z)
      } else {
        ev.ray.intersectPlane(horizontalPlane, intersectionPoint)
        movementVector.copy(intersectionPoint).sub(pointAtMoveStart)
      }

      // calculate beam movement
      movementVector.divideScalar(beamWidth).round()

      const delta: [number, number, number] = [
        movementVector.x,
        movementVector.y,
        movementVector.z,
      ]

      updateMoveTransition(delta)
    },
    [
      pointAtMoveStart,
      movementVector,
      beamWidth,
      updateMoveTransition,
      verticalPlane,
      intersectionPoint,
      horizontalPlane,
    ],
  )

  const handleHover = useCallback(
    (ev) => {
      // console.log('hover', uuid)
      hover()
    },
    [hover],
  )

  const handleUnhover = useCallback(
    (ev) => {
      // console.log('unhover', uuid)
      unhover()
    },
    [unhover],
  )

  const handleClick = useCallback((ev) => {
    ev.stopPropagation()
    // console.log('click x', ev.detail)
  }, [])

  const handlePointerDown = useCallback(
    (ev) => {
      ev.stopPropagation()
      // @ts-ignore
      ev.target.setPointerCapture(ev.pointerId)
      if (!isSelected) select()
      startMoveTransition()
      setPointAtMoveStart(ev.point)
    },
    [startMoveTransition, isSelected, select],
  )

  const handlePointerUp = useCallback(
    (ev) => {
      if (pointAtMoveStart == null) return
      ev.stopPropagation()
      // @ts-ignore
      ev.target.releasePointerCapture(ev.pointerId)
      endMoveTransition()
      setPointAtMoveStart(null)
    },
    [pointAtMoveStart, endMoveTransition],
  )

  const color = useMemo(() => {
    return new Color(isSelected ? 'cyan' : isHovered ? 'magenta' : 'white')
  }, [isSelected, isHovered])

  return (
    <group
      name={`beam-main-${uuid}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handleMove}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
    >
      <group name="beam-material">
        <mesh uuid={uuid} name="beam-texture" geometry={geometry} castShadow>
          <meshLambertMaterial attach="material" color={color}>
            <primitive object={beamTexture} attach="map" />
          </meshLambertMaterial>
        </mesh>
        <mesh name="beam-shadow" geometry={geometry} receiveShadow>
          <shadowMaterial attach="material" />
        </mesh>
      </group>
      {children}
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
    <group name="beam-holes">
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
    <group name="beam-first-hole-markers">
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

interface LengthArrowProps {
  lengthDirection: LengthDirection
  beamDirection: PartValue['direction']
  beamWidth: number
  beamLength: number
  startLengthTransition: () => void
  updateLengthTransition: (
    delta: number,
    lengthDirection: LengthDirection,
  ) => void
  endLengthTransition: () => void
  isSelected: boolean
  select: () => void
}

function LengthArrow(props: LengthArrowProps) {
  const {
    lengthDirection,
    beamDirection,
    beamLength,
    beamWidth,
    startLengthTransition,
    updateLengthTransition,
    endLengthTransition,
    isSelected,
    select,
  } = props

  const arrowAxis =
    lengthDirection === LengthDirection.positive ? X_AXIS : NEGATIVE_X_AXIS

  const position: [number, number, number] = useMemo(() => {
    return lengthDirection === LengthDirection.positive
      ? [(beamLength - 1 / 2) * beamWidth, 0, 0]
      : [(-1 / 2) * beamWidth, 0, 0]
  }, [lengthDirection, beamLength, beamWidth])

  const [pointAtMoveStart, setPointAtMoveStart] = useState<Vector3 | null>(null)

  const handlePointerDown = useCallback(
    (ev: PointerEvent) => {
      ev.stopPropagation()
      // @ts-ignore
      ev.target.setPointerCapture(ev.pointerId)
      startLengthTransition()
      if (!isSelected) select()
      setPointAtMoveStart(ev.point)
    },
    [isSelected, startLengthTransition, select],
  )

  const handlePointerUp = useCallback(
    (ev: PointerEvent) => {
      if (pointAtMoveStart == null) return
      ev.stopPropagation()
      // @ts-ignore
      ev.target.releasePointerCapture(ev.pointerId)
      endLengthTransition()
      setPointAtMoveStart(null)
    },
    [endLengthTransition, pointAtMoveStart],
  )

  const handlePointerMove = useCallback(
    (ev) => {
      ev.stopPropagation()

      if (ev.buttons <= 0) return
      if (pointAtMoveStart == null) return

      const direction = new Vector3(
        beamDirection.x,
        beamDirection.y,
        beamDirection.z,
      )

      if (lengthDirection === LengthDirection.negative) {
        direction.negate()
      }

      const movementVector = new Vector3().copy(ev.point).sub(pointAtMoveStart)

      // https://en.wikipedia.org/wiki/Vector_projection
      const projectionVector = movementVector.clone().projectOnVector(direction)
      const projectionMagnitude = projectionVector.length()
      const projectionAngle = movementVector.angleTo(direction)
      const projectionIsNegative =
        projectionAngle > (1 / 4) * ROTATION &&
        projectionAngle <= (1 / 2) * ROTATION
      const projectionScalar = projectionIsNegative
        ? -projectionMagnitude
        : projectionMagnitude

      const beamLengthChange = Math.round(projectionScalar / beamWidth)

      updateLengthTransition(beamLengthChange, lengthDirection)
    },
    [
      lengthDirection,
      beamDirection.x,
      beamDirection.y,
      beamDirection.z,
      beamWidth,
      pointAtMoveStart,
      updateLengthTransition,
    ],
  )

  const beamIsStandardDirection = useMemo(() => {
    return isStandardDirection(beamDirection)
  }, [beamDirection])

  // TODO: support negative length arrows in non-standard beam directions.
  if (
    lengthDirection === LengthDirection.negative &&
    !beamIsStandardDirection
  ) {
    return null
  }

  return (
    <group name="beam-length-arrow">
      <GlArrow
        position={position}
        direction={arrowAxis}
        length={beamWidth}
        color="magenta"
        headLength={(2 / 3) * beamWidth}
        headWidth={(1 / 2) * beamWidth}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
      {pointAtMoveStart != null && (
        <mesh visible={false} onPointerMove={handlePointerMove}>
          <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
          <meshBasicMaterial attach="material" side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
