import { Text } from 'drei/src/Text'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useThree } from 'react-three-fiber'
import {
  directionVectorToNearestAxisDirection,
  getCurrentPartTransition,
  getCurrentSpecSize,
  getTransitioningParts,
  GlArrow,
  LengthDirection,
  MovePartUpdate,
  NEGATIVE_X_AXIS,
  NEGATIVE_Y_AXIS,
  NEGATIVE_Z_AXIS,
  PartEntity,
  PartTransition,
  PartValue,
  ScalePartUpdate,
  SpecSizeValue,
  Uuid,
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
} from 'src'
import { Box3, Vector3 } from 'three'
// @ts-ignore
import font from 'typeface-ibm-plex-sans/files/ibm-plex-sans-latin-400.woff'

interface ContextualInfoProps {}

export function GlContextualInfo(props: ContextualInfoProps) {
  const transition = useSelector(getCurrentPartTransition)
  const transitioningParts = useSelector(getTransitioningParts)
  const specSize = useSelector(getCurrentSpecSize)

  if (transition == null || specSize == null) return null

  switch (transition.type) {
    case 'move':
      return (
        <MoveInfo
          specSize={specSize}
          transition={transition}
          transitioningParts={transitioningParts}
        />
      )
    case 'scale':
      return (
        <ScaleInfo
          specSize={specSize}
          transition={transition}
          transitioningParts={transitioningParts}
        />
      )
    default:
      return null
  }
}

interface InfoProps<T extends PartTransition> {
  specSize: SpecSizeValue
  transition: T
  transitioningParts: Array<PartValue>
}

function MoveInfo(props: InfoProps<MovePartUpdate>) {
  const { specSize, transition } = props
  const {
    payload: { uuids, delta },
  } = transition

  const { scene, camera } = useThree()

  const transitioningPartsBox = useMemo(() => new Box3(), [])
  const transitioningPartsCenter = useMemo(() => new Vector3(), [])
  const beamWidth = specSize.normalizedBeamWidth

  const transitioningPartsCenterPosition: [
    number,
    number,
    number,
  ] = useMemo(() => {
    transitioningPartsBox.makeEmpty()
    uuids.forEach((uuid: Uuid) => {
      const mesh = scene.getObjectByName(`beam-main-${uuid}`)
      if (mesh != null) transitioningPartsBox.expandByObject(mesh)
    })
    transitioningPartsBox.getCenter(transitioningPartsCenter)
    return transitioningPartsCenter.toArray() as [number, number, number]
  }, [scene, uuids, transitioningPartsBox, transitioningPartsCenter])

  const lengths = useMemo(
    () => [delta[0] * beamWidth, delta[1] * beamWidth, delta[2] * beamWidth],
    [delta, beamWidth],
  )

  return (
    <group position={transitioningPartsCenterPosition}>
      {delta[0] !== 0 && (
        <>
          <Text
            color="black"
            font={font}
            fontSize={2 * beamWidth}
            anchorX="center"
            anchorY="middle"
            position={[lengths[0] / 2, 0, 0]}
            // thank you https://stackoverflow.com/a/20473374
            quaternion={camera.quaternion}
          >
            {String(delta[0])}
          </Text>
          <GlArrow
            direction={delta[0] > 0 ? X_AXIS : NEGATIVE_X_AXIS}
            color="black"
            length={Math.abs(lengths[0])}
            headWidth={0.01}
            headLength={0.02}
          />
        </>
      )}
      {delta[1] !== 0 && (
        <>
          <Text
            color="black"
            font={font}
            fontSize={2 * beamWidth}
            anchorX="center"
            anchorY="middle"
            position={[0, lengths[1] / 2, 0]}
            quaternion={camera.quaternion}
          >
            {String(delta[1])}
          </Text>
          <GlArrow
            direction={delta[1] >= 0 ? Y_AXIS : NEGATIVE_Y_AXIS}
            color="black"
            length={Math.abs(lengths[1])}
            headWidth={0.01}
            headLength={0.02}
          />
        </>
      )}
      {delta[2] !== 0 && (
        <>
          <Text
            color="black"
            font={font}
            fontSize={2 * beamWidth}
            anchorX="center"
            anchorY="middle"
            position={[0, 0, lengths[2] / 2]}
            quaternion={camera.quaternion}
          >
            {String(delta[2])}
          </Text>
          <GlArrow
            direction={delta[2] >= 0 ? Z_AXIS : NEGATIVE_Z_AXIS}
            color="black"
            length={Math.abs(lengths[2])}
            headWidth={0.01}
            headLength={0.02}
          />
        </>
      )}
    </group>
  )
}

function ScaleInfo(props: InfoProps<ScalePartUpdate>) {
  const { specSize, transition, transitioningParts } = props

  return (
    <group>
      {transitioningParts.map((transitioningPart) => (
        <ScaleInfoForBeam
          key={transitioningPart.uuid}
          specSize={specSize}
          transition={transition}
          transitioningPart={transitioningPart}
        />
      ))}
    </group>
  )
}

interface ScaleInfoForBeamProps {
  specSize: SpecSizeValue
  transition: ScalePartUpdate
  transitioningPart: PartValue
}

function ScaleInfoForBeam(props: ScaleInfoForBeamProps) {
  const { specSize, transition, transitioningPart } = props
  const {
    payload: { delta, lengthDirection },
  } = transition
  const {
    direction,
    length,
    origin,
    position,
    stateBeforeTransition,
  } = transitioningPart
  const {
    direction: directionBeforeTransition,
    origin: originBeforeTransition,
    length: lengthBeforeTransition,
  } = stateBeforeTransition as PartEntity
  const beamWidth = specSize.normalizedBeamWidth

  const { camera } = useThree()

  const positionScalar = useMemo(() => {
    return length * beamWidth
  }, [length, beamWidth])

  const midPositionScalar = useMemo(() => {
    return (1 / 2) * positionScalar
  }, [positionScalar])

  const nudgeToCamera: [number, number, number] = useMemo(() => {
    let worldDirectionVector = new Vector3()
    camera.getWorldDirection(worldDirectionVector)
    worldDirectionVector.negate()
    const beamDirectionVector = new Vector3(
      directionBeforeTransition.x,
      directionBeforeTransition.y,
      directionBeforeTransition.z,
    )
    const nudgeVector = new Vector3().crossVectors(
      worldDirectionVector,
      beamDirectionVector,
    )
    const nudgeAxisDirection = directionVectorToNearestAxisDirection(
      nudgeVector,
    )
    return [
      nudgeAxisDirection.x * 2 * beamWidth,
      nudgeAxisDirection.y * 2 * beamWidth,
      nudgeAxisDirection.z * 2 * beamWidth,
    ]
  }, [camera, beamWidth, directionBeforeTransition])

  const textPosition: [number, number, number] = useMemo(
    () => [
      position[0] + direction.x * midPositionScalar + nudgeToCamera[0],
      position[1] + direction.y * midPositionScalar + nudgeToCamera[1],
      position[2] + direction.z * midPositionScalar + nudgeToCamera[2],
    ],
    [
      direction.x,
      direction.y,
      direction.z,
      position,
      midPositionScalar,
      nudgeToCamera,
    ],
  )

  const arrowStart = useMemo(() => {
    if (lengthDirection === LengthDirection.positive) {
      return new Vector3(
        originBeforeTransition.x + direction.x * lengthBeforeTransition,
        originBeforeTransition.y + direction.y * lengthBeforeTransition,
        originBeforeTransition.z + direction.z * lengthBeforeTransition,
      )
    } else {
      return new Vector3(
        originBeforeTransition.x,
        originBeforeTransition.y,
        originBeforeTransition.z,
      )
    }
  }, [
    lengthDirection,
    originBeforeTransition.x,
    originBeforeTransition.y,
    originBeforeTransition.z,
    direction.x,
    direction.y,
    direction.z,
    lengthBeforeTransition,
  ])

  const arrowEnd = useMemo(() => {
    if (lengthDirection === LengthDirection.positive) {
      return new Vector3(
        origin.x + direction.x * length,
        origin.y + direction.y * length,
        origin.z + direction.z * length,
      )
    } else {
      return new Vector3(origin.x, origin.y, origin.z)
    }
  }, [
    lengthDirection,
    origin.x,
    origin.y,
    origin.z,
    direction.x,
    direction.y,
    direction.z,
    length,
  ])

  const arrowDelta = useMemo(() => {
    return new Vector3()
      .subVectors(arrowEnd, arrowStart)
      .multiplyScalar(beamWidth)
  }, [arrowStart, arrowEnd, beamWidth])

  const arrowOrigin: [number, number, number] = useMemo(() => {
    return [
      arrowStart.x * beamWidth + nudgeToCamera[0],
      arrowStart.y * beamWidth + nudgeToCamera[1],
      arrowStart.z * beamWidth + nudgeToCamera[2],
    ]
  }, [arrowStart, beamWidth, nudgeToCamera])

  const arrowLength = useMemo(() => arrowDelta.length(), [arrowDelta])

  const arrowDirection = useMemo(() => {
    return new Vector3().copy(arrowDelta).normalize()
  }, [arrowDelta])

  return (
    <group>
      <Text
        color="black"
        font={font}
        fontSize={2 * beamWidth}
        anchorX="center"
        anchorY="middle"
        position={textPosition}
        quaternion={camera.quaternion}
      >
        {String(length)}
      </Text>
      {delta !== 0 && (
        <GlArrow
          origin={arrowOrigin}
          direction={arrowDirection}
          color="black"
          length={arrowLength}
          headWidth={0.01}
          headLength={0.02}
        />
      )}
    </group>
  )
}
