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
  ROTATION,
  SpecSizeValue,
  Uuid,
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
} from 'src'
import { Box3, Euler, Quaternion, Vector3 } from 'three'
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

  const { scene, camera, raycaster } = useThree()

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

  // TODO rotate text to face camera

  return (
    <group position={transitioningPartsCenterPosition}>
      {delta[0] !== 0 && (
        <>
          <Text
            color="black"
            font={font}
            fontSize={2 * beamWidth}
            anchorX="center"
            anchorY={delta[1] > 0 ? 'bottom' : 'top'}
            position={[lengths[0] / 2, 0, 0]}
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
            anchorX={delta[0] > 0 ? 'left' : 'right'}
            anchorY="middle"
            position={[0, lengths[1] / 2, 0]}
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

let axis = new Vector3()

function setDirection(normal, quaternion) {
  quaternion = quaternion || new THREE.Quaternion()
  // vector is assumed to be normalized
  if (normal.y > 0.99999) {
    quaternion.set(0, 0, 0, 1)
  } else if (normal.y < -0.99999) {
    quaternion.set(1, 0, 0, 0)
  } else {
    axis.set(normal.z, 0, -normal.x).normalize()
    var radians = Math.acos(normal.y)
    quaternion.setFromAxisAngle(axis, radians)
  }
  return quaternion
}
