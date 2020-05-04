import { range } from 'lodash'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useResource } from 'react-three-fiber'
import { BoxGeometry, Color, Plane, Vector3 } from 'three'

import { directionToRotation } from '../helpers/rotation'
import {
  doDisableCameraControl,
  doDisableSelection,
  doEnableCameraControl,
  doEnableSelection,
  doSetAnyPartIsMoving,
  getCurrentSpecMaterials,
  getCurrentSpecSizes,
} from '../store'

export default Beam

function Beam(props) {
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

  const position = React.useMemo(() => {
    return [
      (1 / 2 + origin.x) * beamWidth,
      (1 / 2 + origin.y) * beamWidth,
      (1 / 2 + origin.z) * beamWidth,
    ]
  }, [beamWidth, origin])

  const [atMoveStart, setAtMoveStart] = React.useState(null)
  const handleMove = React.useCallback(
    (ev) => {
      ev.stopPropagation()
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

      move(delta.toArray())
    },
    [atMoveStart, beamWidth, origin.x, origin.y, origin.z, move],
  )

  const handleHover = React.useCallback(
    (ev) => {
      ev.stopPropagation()
      // console.log('hover', uuid)
      hover()
    },
    [hover],
  )

  const handleUnhover = React.useCallback(
    (ev) => {
      ev.stopPropagation()
      // console.log('unhover', uuid)
      unhover()
    },
    [unhover],
  )

  const handleClick = React.useCallback((ev) => {
    ev.stopPropagation()
    // console.log('click x', ev.detail)
    // if (ev.detail > 1) select()
  }, [])

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
      onPointerDown={(ev) => {
        ev.stopPropagation()
        ev.target.setPointerCapture(ev.pointerId)
        dispatch(doDisableCameraControl())
        dispatch(doDisableSelection())
        dispatch(doSetAnyPartIsMoving(true))
        if (!isSelected) select()
        setAtMoveStart([ev.point, origin])
      }}
      onPointerUp={(ev) => {
        ev.stopPropagation()
        ev.target.releasePointerCapture(ev.pointerId)
        dispatch(doEnableCameraControl())
        dispatch(doEnableSelection())
        dispatch(doSetAnyPartIsMoving(false))
        setAtMoveStart(null)
      }}
      onPointerMove={handleMove}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
    >
      <mesh uuid={uuid} geometry={geometry} castShadow receiveShadow>
        <meshLambertMaterial attach="material" color={color}>
          <primitive object={beamTexture} attach="map" />
        </meshLambertMaterial>
      </mesh>
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

function Holes(props) {
  const { numHoles, beamWidth, holeDiameter } = props
  const holeRadius = holeDiameter / 2

  const [materialRef, material] = useResource()
  const [geometryRef, geometry] = useResource()

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
            position={[index * beamWidth, 0, 0.01 + (1 / 2) * beamWidth]}
          />
          {/* bottom */}
          <mesh
            material={material}
            geometry={geometry}
            rotation={[Math.PI, 0, 0]}
            position={[index * beamWidth, 0, -0.01 - (1 / 2) * beamWidth]}
          />
          {/* left */}
          <mesh
            material={material}
            geometry={geometry}
            rotation={[(3 / 2) * Math.PI, 0, 0]}
            position={[index * beamWidth, 0.01 + (1 / 2) * beamWidth, 0]}
          />
          {/* right */}
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

function FirstHoleMarker(props) {
  const { beamWidth, holeDiameter } = props
  return (
    <group>
      {/* top */}
      <HoleMarker
        rotation={[-(1 / 2) * Math.PI, 0, 0]}
        position={[0, 0, 0.02 + (1 / 2) * beamWidth]}
        holeDiameter={holeDiameter}
      />
      {/* bottom */}
      <HoleMarker
        rotation={[(1 / 2) * Math.PI, 0, 0]}
        position={[0, 0, -0.02 - (1 / 2) * beamWidth]}
        holeDiameter={holeDiameter}
      />
      {/* left */}
      <HoleMarker
        rotation={[Math.PI, 0, 0]}
        position={[0, 0.02 + (1 / 2) * beamWidth, 0]}
        holeDiameter={holeDiameter}
      />
      {/* right */}
      <HoleMarker
        rotation={[0, 0, 0]}
        position={[0, -0.02 - (1 / 2) * beamWidth, 0]}
        holeDiameter={holeDiameter}
      />
    </group>
  )
}

function HoleMarker(props) {
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
        HOLE_MARKER_COLOR2,
      ]}
      {...forwardedProps}
    />
  )
}
