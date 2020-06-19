// import { usePreviousValue } from '@huse/previous-value'
import type CameraControlsType from 'camera-controls'
// import { isEqual, map } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ReactThreeFiber } from 'react-three-fiber'
import { useThree } from 'react-three-fiber'
import {
  doSetCameraControls,
  getIsCameraControlEnabled,
  // getIsPartTransitioning,
  // getIsSelecting,
  // getParts,
  // getSelectedParts,
  useAppDispatch,
  // Uuid,
} from 'src'
import { /* Box3, */ OrthographicCamera /*, Scene, Vector3 */ } from 'three'
import { useCallbackRef } from 'use-callback-ref'

import { GlCameraControls } from './camera-controls'

const ROT = Math.PI * 2

interface CameraProps {}

export function GlCamera(props: CameraProps) {
  const dispatch = useAppDispatch()
  const canvasContext = useThree()

  const { /* scene, */ size } = canvasContext
  const camera = canvasContext.camera as OrthographicCamera

  // force update when camera controls ref mutates
  const [, forceUpdate] = useState()
  const controlsRef = useCallbackRef<CameraControlsType>(null, forceUpdate)
  // so we will always have ref here before
  // (fixes bug where camera input not setup until first re-render)
  useEffect(() => {
    const controls = controlsRef.current
    if (controls) dispatch(doSetCameraControls(controls))
  }, [controlsRef, dispatch])

  const isControlEnabled = useSelector(getIsCameraControlEnabled)
  /*
  const selectedParts = useSelector(getSelectedParts)
  const parts = useSelector(getParts)
  const isTransitioning = useSelector(getIsPartTransitioning)
  const isSelecting = useSelector(getIsSelecting)

  const previousSelectedParts = usePreviousValue<typeof selectedParts>(
    selectedParts,
  )
  */

  useEffect(() => {
    const controls = controlsRef.current
    if (controls == null) return
    camera.left = size.width / -200
    camera.right = size.width / 200
    camera.top = size.height / 200
    camera.bottom = size.height / -200
    camera.near = 1
    camera.far = 1000
    camera.position.set(0, 0, 5)
    controls.zoomTo(5)
    controls.rotateTo((3 / 8) * ROT, (3 / 16) * ROT)
    camera.updateProjectionMatrix()
  }, [camera, controlsRef, size])

  /*
  // center camera on parts
  // TODO: create a center object with right-click
  // - move it around to change the center
  // - removing the center goes back to the default behavior
  useEffect(() => {
    if (isTransitioning || isSelecting) return
    const controls = controlsRef.current
    if (controls == null) return

    let centeredParts = parts
    if (selectedParts.length > 0) {
      centeredParts = selectedParts
    }

    if (centeredParts.length === 0) {
      controls.setTarget(0, 0, 0)
      return
    }

    // don't move camera if no change in selected parts
    if (isEqual(selectedParts, previousSelectedParts)) {
      return
    }

    const uuids = map(centeredParts, 'uuid')
    const box = compute3dBounds(scene, uuids)
    const center = new Vector3()
    box.getCenter(center)
    controls.setTarget(center.x, center.y, center.z)
  }, [
    isTransitioning,
    scene,
    parts,
    selectedParts,
    previousSelectedParts,
    isSelecting,
    controlsRef,
  ])
  */

  return (
    <GlCameraControls
      ref={controlsRef}
      enabled={isControlEnabled}
      dampingFactor={0.1}
      azimuthRotateSpeed={0.5}
      polarRotateSpeed={0.5}
    />
  )
}

/*
function compute3dBounds(scene: Scene, uuids: Array<Uuid>) {
  const box = new Box3()

  uuids.forEach((uuid) => {
    const mesh = scene.getObjectByName(`beam-main-${uuid}`)
    if (mesh != null) box.expandByObject(mesh)
  })

  return box
}
*/
