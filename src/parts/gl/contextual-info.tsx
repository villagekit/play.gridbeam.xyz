import { Text } from 'drei/src/Text'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useThree } from 'react-three-fiber'
import {
  getCurrentPartTransition,
  getCurrentSpecSize,
  getTransitioningParts,
  GlArrow,
  MovePartUpdate,
  NEGATIVE_X_AXIS,
  NEGATIVE_Y_AXIS,
  NEGATIVE_Z_AXIS,
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
  const { specSize, transitioningParts } = props

  return (
    <group>
      {transitioningParts.map((transitioningPart) => (
        <ScaleInfoForBeam
          specSize={specSize}
          transitioningPart={transitioningPart}
        />
      ))}
    </group>
  )
}

interface ScaleInfoForBeamProps {
  specSize: SpecSizeValue
  transitioningPart: PartValue
}

function ScaleInfoForBeam(props: ScaleInfoForBeamProps) {
  const { specSize, transitioningPart } = props
  const { direction, length, position } = transitioningPart
  const beamWidth = specSize.normalizedBeamWidth

  const { camera } = useThree()

  const positionScalar = useMemo(() => {
    return (length / 2) * beamWidth
  }, [length, beamWidth])

  const negativeWorldDirection = useMemo(() => {
    let worldDirection = new Vector3()
    camera.getWorldDirection(worldDirection)
    worldDirection.negate()
    return worldDirection.toArray() as [number, number, number]
  }, [camera])

  const nudgeToCamera: [number, number, number] = useMemo(
    () => [
      negativeWorldDirection[0] * 4 * beamWidth,
      negativeWorldDirection[1] * 4 * beamWidth,
      negativeWorldDirection[2] * 4 * beamWidth,
    ],
    [negativeWorldDirection, beamWidth],
  )

  const textPosition: [number, number, number] = useMemo(
    () => [
      direction.x * positionScalar + nudgeToCamera[0],
      direction.y * positionScalar + nudgeToCamera[1],
      direction.z * positionScalar + nudgeToCamera[2],
    ],
    [direction, positionScalar, nudgeToCamera],
  )

  return (
    <group position={position}>
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
    </group>
  )
}
