import { range } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { PointerEvent, useResource, useUpdate } from 'react-three-fiber'
import { Group as GroupComponent, Line } from 'react-three-fiber/components'
import {
  Direction,
  directionToRotation,
  doDisableCameraControl,
  doDisableSelection,
  doEnableCameraControl,
  doEnableSelection,
  doSetAnyPartIsMoving,
  doUpdatePart,
  getCurrentSpecMaterials,
  getCurrentSpecSizes,
  GridPosition,
  isStandardDirection,
  NEGATIVE_X_AXIS,
  PartValue,
  ROTATION,
  TexturesByMaterialType,
  UpdateDescriptor,
  useAppDispatch,
  Uuid,
  X_AXIS,
} from 'src'
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderBufferGeometry,
  Float32BufferAttribute,
  Group,
  MeshBasicMaterial,
  Plane,
  RingGeometry,
  Texture,
  Vector3,
} from 'three'

enum ArrowDirection {
  positive = 'positive',
  negative = 'negative',
}

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

  const dispatch = useAppDispatch()

  const currentSpecSizes = useSelector(getCurrentSpecSizes)
  const currentSpecMaterials = useSelector(getCurrentSpecMaterials)

  const beamSpecSize = currentSpecSizes[sizeId]
  const beamSpecMaterial = currentSpecMaterials[materialId]
  const beamSpecMaterialSize = beamSpecMaterial.sizes[sizeId]

  const beamWidth = beamSpecSize.normalizedBeamWidth
  const holeDiameter = beamSpecMaterialSize.normalizedHoleDiameter

  const position: [number, number, number] = React.useMemo(() => {
    return [
      (1 / 2 + origin.x) * beamWidth,
      (1 / 2 + origin.y) * beamWidth,
      (1 / 2 + origin.z) * beamWidth,
    ]
  }, [beamWidth, origin])

  const rotation = React.useMemo(() => {
    return directionToRotation(direction)
  }, [direction])

  const beamTexture = React.useMemo(() => {
    return texturesByMaterialType[beamSpecMaterial.id]
  }, [beamSpecMaterial.id, texturesByMaterialType])

  const lockBeforeMoving = useCallback(() => {
    dispatch(doDisableCameraControl())
    dispatch(doDisableSelection())
    dispatch(doSetAnyPartIsMoving(true))
  }, [dispatch])

  const unlockAfterMoving = useCallback(() => {
    dispatch(doEnableCameraControl())
    dispatch(doEnableSelection())
    dispatch(doSetAnyPartIsMoving(false))
  }, [dispatch])

  const updatePart = useCallback(
    (updater: UpdateDescriptor) => {
      dispatch(doUpdatePart({ uuid, updater }))
    },
    [dispatch, uuid],
  )

  return (
    <group name="beam" position={position} rotation={rotation}>
      <BeamMain
        uuid={uuid}
        origin={origin}
        length={length}
        move={move}
        hover={hover}
        unhover={unhover}
        isHovered={isHovered}
        select={select}
        isSelected={isSelected}
        beamWidth={beamWidth}
        beamTexture={beamTexture}
        lockBeforeMoving={lockBeforeMoving}
        unlockAfterMoving={unlockAfterMoving}
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
      {[ArrowDirection.positive, ArrowDirection.negative].map(
        (arrowDirection) => (
          <LengthArrow
            key={arrowDirection}
            arrowDirection={arrowDirection}
            beamDirection={direction}
            beamOrigin={origin}
            beamWidth={beamWidth}
            beamLength={length}
            updatePart={updatePart}
            lockBeforeMoving={lockBeforeMoving}
            unlockAfterMoving={unlockAfterMoving}
            isSelected={isSelected}
            select={select}
          />
        ),
      )}
    </group>
  )
}

interface BeamMainProps {
  uuid: Uuid
  origin: PartValue['origin']
  length: PartValue['length']
  move: (movement: [number, number, number]) => void
  hover: () => void
  unhover: () => void
  isHovered: PartValue['isHovered']
  select: () => void
  isSelected: PartValue['isSelected']
  beamWidth: number
  beamTexture: Texture
  lockBeforeMoving: () => void
  unlockAfterMoving: () => void
  children: React.ReactNode
}

function BeamMain(props: BeamMainProps) {
  const {
    uuid,
    origin,
    length,
    move,
    hover,
    unhover,
    isHovered,
    select,
    isSelected,
    beamWidth,
    beamTexture,
    lockBeforeMoving,
    unlockAfterMoving,
    children,
  } = props

  const geometry = React.useMemo(() => {
    const boxSize = [beamWidth * length, beamWidth, beamWidth]
    const boxGeometry = new BoxGeometry(...boxSize, length)
    // translate beam so first hole is at (0, 0).
    // this way, the first hole is preserved across rotations.
    boxGeometry.translate((beamWidth * (length - 1)) / 2, 0, 0)

    return boxGeometry
  }, [beamWidth, length])

  const [atMoveStart, setAtMoveStart] = React.useState<
    [Vector3, GridPosition] | null
  >(null)
  const handleMove = useCallback(
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
      lockBeforeMoving()
      if (!isSelected) select()
      setAtMoveStart([ev.point, origin])
    },
    [lockBeforeMoving, isSelected, select, origin],
  )

  const handlePointerUp = useCallback(
    (ev) => {
      if (atMoveStart == null) return
      ev.stopPropagation()
      // @ts-ignore
      ev.target.releasePointerCapture(ev.pointerId)
      unlockAfterMoving()
      setAtMoveStart(null)
    },
    [atMoveStart, unlockAfterMoving],
  )

  const color = React.useMemo(() => {
    return new Color(isSelected ? 'cyan' : isHovered ? 'magenta' : 'white')
  }, [isSelected, isHovered])

  return (
    <group
      name="beam-main"
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
  arrowDirection: ArrowDirection
  beamDirection: PartValue['direction']
  beamOrigin: PartValue['origin']
  beamWidth: number
  beamLength: number
  updatePart: (updater: UpdateDescriptor) => void
  lockBeforeMoving: () => void
  unlockAfterMoving: () => void
  isSelected: boolean
  select: () => void
}

function LengthArrow(props: LengthArrowProps) {
  const {
    arrowDirection,
    beamDirection,
    beamLength,
    beamOrigin,
    beamWidth,
    lockBeforeMoving,
    unlockAfterMoving,
    isSelected,
    select,
    updatePart,
  } = props

  const arrowAxis =
    arrowDirection === ArrowDirection.positive ? X_AXIS : NEGATIVE_X_AXIS

  const position: [number, number, number] = useMemo(() => {
    return arrowDirection === ArrowDirection.positive
      ? [(beamLength - 1 / 2) * beamWidth, 0, 0]
      : [(-1 / 2) * beamWidth, 0, 0]
  }, [arrowDirection, beamLength, beamWidth])

  const [
    pointAtMoveStart,
    setPointAtMoveStart,
  ] = React.useState<Vector3 | null>(null)
  const [beamLengthAtMoveStart, setBeamLengthAtMoveStart] = React.useState<
    number | null
  >(null)

  const handleLengthChange = useCallback(
    (change: number) => {
      if (arrowDirection === ArrowDirection.positive) {
        updatePart([
          // update length by change
          {
            update: 'add',
            path: 'length',
            value: change,
          },
        ])
      } else if (arrowDirection === ArrowDirection.negative) {
        // TODO tidy this up
        let beamDirectionAxis
        if (Math.abs(beamDirection.x) === 1) beamDirectionAxis = 'x'
        else if (Math.abs(beamDirection.y) === 1) beamDirectionAxis = 'y'
        else if (Math.abs(beamDirection.z) === 1) beamDirectionAxis = 'z'
        if (beamDirectionAxis === undefined)
          throw new Error('incorrect beam direction axis')

        if (beamDirectionAxis === 'z' && beamOrigin.z === 0 && change > 0)
          return

        let beamDirectionUpdate = 'sub'
        if (
          beamDirection.x === -1 ||
          beamDirection.y === -1 ||
          beamDirection.z === -1
        ) {
          beamDirectionUpdate = 'add'
        }
        updatePart([
          // update length by change
          {
            update: 'add',
            path: 'length',
            value: change,
          },
          // move forward by change
          {
            update: beamDirectionUpdate,
            path: ['origin', beamDirectionAxis],
            value: change,
          },
        ])
      }
    },
    [
      arrowDirection,
      beamDirection.x,
      beamDirection.y,
      beamDirection.z,
      beamOrigin,
      updatePart,
    ],
  )

  const handlePointerDown = useCallback(
    (ev: PointerEvent) => {
      ev.stopPropagation()
      // @ts-ignore
      ev.target.setPointerCapture(ev.pointerId)
      lockBeforeMoving()
      if (!isSelected) select()
      setPointAtMoveStart(ev.point)
      setBeamLengthAtMoveStart(beamLength)
    },
    [beamLength, isSelected, lockBeforeMoving, select],
  )

  const handlePointerUp = useCallback(
    (ev: PointerEvent) => {
      if (pointAtMoveStart == null || beamLengthAtMoveStart == null) return
      ev.stopPropagation()
      // @ts-ignore
      ev.target.releasePointerCapture(ev.pointerId)
      unlockAfterMoving()
      setPointAtMoveStart(null)
      setBeamLengthAtMoveStart(null)
    },
    [beamLengthAtMoveStart, pointAtMoveStart, unlockAfterMoving],
  )

  const handlePointerMove = useCallback(
    (ev) => {
      ev.stopPropagation()

      if (ev.buttons <= 0) return
      if (pointAtMoveStart == null || beamLengthAtMoveStart == null) return

      const direction = new Vector3(
        beamDirection.x,
        beamDirection.y,
        beamDirection.z,
      )

      if (arrowDirection === ArrowDirection.negative) {
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

      const beamLengthChangeSinceMoveStart = Math.round(
        projectionScalar / beamWidth,
      )

      const nextBeamLength = Math.max(
        1,
        beamLengthAtMoveStart + beamLengthChangeSinceMoveStart,
      )
      const beamLengthChange = nextBeamLength - beamLength
      handleLengthChange(beamLengthChange)
    },
    [
      arrowDirection,
      beamDirection.x,
      beamDirection.y,
      beamDirection.z,
      beamLength,
      beamLengthAtMoveStart,
      beamWidth,
      handleLengthChange,
      pointAtMoveStart,
    ],
  )

  const planeRotation = useMemo(() => {
    return directionToRotation(beamDirection)
  }, [beamDirection])

  const beamIsStandardDirection = useMemo(() => {
    return isStandardDirection(beamDirection)
  }, [beamDirection])

  // TODO: support negative length arrows in non-standard beam directions.
  if (arrowDirection === ArrowDirection.negative && !beamIsStandardDirection) {
    return null
  }

  return (
    <group name="beam-length-arrow">
      <Arrow
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
        <mesh
          // visible={false}
          rotation={planeRotation}
          onPointerMove={handlePointerMove}
        >
          <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
        </mesh>
      )}
    </group>
  )
}

interface ArrowProps extends React.ComponentProps<typeof GroupComponent> {
  direction?: [number, number, number] | Vector3
  origin?: [number, number, number] | Vector3
  color?: string | Color
  length?: number
  headLength?: number
  headWidth?: number
}

function Arrow(props: ArrowProps) {
  const {
    direction = new Vector3(0, 0, 1),
    origin = new Vector3(0, 0, 0),
    color = 0xffff00,
    length = 1,
    headLength = 0.2 * length,
    headWidth = 0.2 * headLength,
    ...containerProps
  } = props

  const arrowRef = useUpdate<Group>(
    (group) => {
      const dir =
        direction instanceof Vector3
          ? direction
          : new Vector3().fromArray(direction)

      if (dir.y > 0.99999) {
        group.quaternion.set(0, 0, 0, 1)
      } else if (dir.y < -0.99999) {
        group.quaternion.set(1, 0, 0, 0)
      } else {
        const axis = new Vector3(dir.z, 0, -dir.x).normalize()
        const radians = Math.acos(dir.y)
        group.quaternion.setFromAxisAngle(axis, radians)
      }
    },
    [direction],
  )

  const lineGeometryRef = useUpdate<BufferGeometry>((geometry) => {
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3),
    )
  }, [])
  const lineScale: [number, number, number] = useMemo(() => {
    return [1, Math.max(0.0001, length - headLength), 1]
  }, [headLength, length])

  const coneGeometryRef = useUpdate<CylinderBufferGeometry>((geometry) => {
    geometry.translate(0, -0.5, 0)
  }, [])
  const coneScale: [number, number, number] = useMemo(() => {
    return [headWidth, headLength, headWidth]
  }, [headWidth, headLength])
  const conePosition: [number, number, number] = useMemo(() => [0, length, 0], [
    length,
  ])

  return (
    <group name="arrow" {...containerProps}>
      <group ref={arrowRef} position={origin}>
        <Line scale={lineScale}>
          <bufferGeometry attach="geometry" ref={lineGeometryRef} />
          <lineBasicMaterial
            attach="material"
            color={color}
            toneMapped={false}
          />
        </Line>
        <mesh position={conePosition} scale={coneScale}>
          <cylinderBufferGeometry
            attach="geometry"
            ref={coneGeometryRef}
            args={[0, 0.5, 1, 5, 1]}
          />
          <meshBasicMaterial
            attach="material"
            color={color}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}
