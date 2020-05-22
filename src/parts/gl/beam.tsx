import { range } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { PointerEvent, useResource, useUpdate } from 'react-three-fiber'
import { Group as GroupComponent, Line } from 'react-three-fiber/components'
import {
  AppDispatch,
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
  NEGATIVE_X_AXIS,
  PartValue,
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

  const updatePart = React.useCallback(
    (updater: UpdateDescriptor) => {
      dispatch(doUpdatePart({ uuid, updater }))
    },
    [dispatch, uuid],
  )

  return (
    <group position={position} rotation={rotation}>
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
        dispatch={dispatch}
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
      <LengthArrowAtOrigin
        beamDirection={direction}
        beamOrigin={origin}
        beamWidth={beamWidth}
        updatePart={updatePart}
      />
      <LengthArrowAtEnd
        beamDirection={direction}
        beamOrigin={origin}
        beamWidth={beamWidth}
        updatePart={updatePart}
        length={length}
      />
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
  dispatch: AppDispatch
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
    dispatch,
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

  return (
    <group
      name={uuid}
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

interface LengthArrowAtProps {
  beamDirection: PartValue['direction']
  beamOrigin: PartValue['origin']
  beamWidth: number
  updatePart: (updater: UpdateDescriptor) => void
}

interface LenghtArrowAtOriginProps extends LengthArrowAtProps {}

function LengthArrowAtOrigin(props: LengthArrowAtProps) {
  const { beamDirection, beamOrigin, beamWidth, updatePart } = props

  const handleLengthChange = React.useCallback((change: number) => {
    console.log('change', change)
    /*
    updatePart([
      // decrease length by change
      {
      },
      // move forward by change
      {
      }
    ])
    */
  }, [])

  return (
    <LengthArrow
      arrowAxis={NEGATIVE_X_AXIS}
      beamDirection={beamDirection}
      beamOrigin={beamOrigin}
      beamWidth={beamWidth}
      handleLengthChange={handleLengthChange}
      position={[(-1 / 2) * beamWidth, 0, 0]}
    />
  )
}

interface LengthArrowAtEndProps extends LengthArrowAtProps {
  length: number
}

function LengthArrowAtEnd(props: LengthArrowAtEndProps) {
  const { beamDirection, beamOrigin, beamWidth, length, updatePart } = props

  const handleLengthChange = React.useCallback((change: number) => {
    console.log('change', change)
    /*
    updatePart([
      // increase length by change
      {
      },
    ])
    */
  }, [])

  return (
    <LengthArrow
      arrowAxis={X_AXIS}
      beamDirection={beamDirection}
      beamOrigin={beamOrigin}
      beamWidth={beamWidth}
      handleLengthChange={handleLengthChange}
      position={[(1 / 2 + length) * beamWidth, 0, 0]}
    />
  )
}

// NOTE: to determine the length change from dragging the arrow, we project the cursor onto the beam's direction axis.

interface LengthArrowProps extends React.ComponentProps<typeof Arrow> {
  arrowAxis: Vector3
  beamDirection: PartValue['direction']
  beamOrigin: PartValue['origin']
  beamWidth: number
  handleLengthChange: (change: number) => void
}

function LengthArrow(props: LengthArrowProps) {
  const {
    arrowAxis,
    beamDirection,
    beamWidth,
    handleLengthChange,
    ...arrowHelperProps
  } = props

  const handlePointerDown = useCallback((ev: PointerEvent) => {
    console.log('down', ev)
    ev.stopPropagation()
  }, [])

  const handlePointerUp = useCallback((ev: PointerEvent) => {
    console.log('up')
    ev.stopPropagation()
  }, [])

  const handlePointerMove = useCallback((ev: PointerEvent) => {
    console.log('move')
    ev.stopPropagation()
  }, [])

  const colorHex = React.useMemo(() => new Color('magenta').getHex(), [])

  return (
    /*
    <arrowHelper
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      args={[
        arrowAxis,
        undefined, // origin
        beamWidth, // length
        colorHex, // hex
        (1 / 2) * beamWidth, // head length
        (1 / 3) * beamWidth, // headWidth
      ]}
      {...arrowHelperProps}
    />
    */
    <Arrow
      direction={arrowAxis}
      length={beamWidth}
      color="magenta"
      headLength={(1 / 2) * beamWidth}
      headWidth={(1 / 3) * beamWidth}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      {...arrowHelperProps}
    />
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
    <group {...containerProps}>
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
