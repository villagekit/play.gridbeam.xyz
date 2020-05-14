import { usePreviousValue } from '@huse/previous-value'
import type CameraControlsType from 'camera-controls'
import { isEqual, map } from 'lodash'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ReactThreeFiber } from 'react-three-fiber'
import { extend, useFrame, useThree } from 'react-three-fiber'
import {
  getAnyPartIsMoving,
  getIsCameraControlEnabled,
  getIsSelecting,
  getParts,
  getSelectedParts,
  useCameraInput,
  Uuid,
} from 'src'
import { Box3, OrthographicCamera, Scene, Vector3 } from 'three'
import * as THREE from 'three'
import { useCallbackRef, useMergeRefs } from 'use-callback-ref'

const ROT = Math.PI * 2

interface CameraProps {}

export function GlCamera(props: CameraProps) {
  const canvasContext = useThree()

  const { scene, size } = canvasContext
  const camera = canvasContext.camera as OrthographicCamera

  // force update when camera controls ref mutates
  const [, forceUpdate] = useState()
  const controlsRef = useCallbackRef<CameraControlsType>(null, forceUpdate)
  // so we will always have ref here before
  // (fixes bug where camera input not setup until first re-render)
  useCameraInput(controlsRef.current)

  const isControlEnabled = useSelector(getIsCameraControlEnabled)
  const parts = useSelector(getParts)
  const selectedParts = useSelector(getSelectedParts)
  const isMoving = useSelector(getAnyPartIsMoving)
  const isSelecting = useSelector(getIsSelecting)

  const previousSelectedParts = usePreviousValue<typeof selectedParts>(
    selectedParts,
  )

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

  // center camera on parts
  // TODO: create a center object with right-click
  // - move it around to change the center
  // - removing the center goes back to the default behavior
  useEffect(() => {
    if (isMoving || isSelecting) return
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
    isMoving,
    scene,
    parts,
    selectedParts,
    previousSelectedParts,
    isSelecting,
    controlsRef,
  ])

  return (
    <CameraControls
      ref={controlsRef}
      enabled={isControlEnabled}
      dampingFactor={0.1}
      azimuthRotateSpeed={0.5}
      polarRotateSpeed={0.5}
    />
  )
}

function compute3dBounds(scene: Scene, uuids: Array<Uuid>) {
  const box = new Box3()

  uuids.forEach((uuid) => {
    const mesh = scene.getObjectByName(uuid)
    if (mesh != null) box.expandByObject(mesh)
  })

  return box
}

// https://github.com/react-spring/drei/blob/master/src/OrbitControls.tsx

const CameraControlsImpl =
  typeof window !== 'undefined' ? require('camera-controls').default : null

if (CameraControlsImpl != null) {
  CameraControlsImpl.install({ THREE })

  extend({ CameraControlsImpl })
}

type CameraControlsProps = ReactThreeFiber.Object3DNode<
  CameraControlsType,
  typeof CameraControlsImpl
>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cameraControlsImpl: CameraControlsProps
    }
  }
}

export const CameraControls = forwardRef<
  CameraControlsType,
  CameraControlsProps
>((props, ref) => {
  const controlsRef = useRef<CameraControlsType>(null)

  const { camera, gl, invalidate } = useThree()

  useFrame((_, delta) => controlsRef.current?.update(delta))

  useEffect(() => {
    const controls = controlsRef.current
    controls?.addEventListener('change', invalidate)
    return () => controls?.removeEventListener('change', invalidate)
  }, [invalidate])

  return (
    <cameraControlsImpl
      ref={useMergeRefs<CameraControlsType>([controlsRef, ref])}
      args={[camera, gl.domElement]}
      {...props}
    />
  )
})
