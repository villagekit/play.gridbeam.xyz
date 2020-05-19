import type CameraControlsType from 'camera-controls'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useStore } from 'react-redux'
import { Canvas, useThree } from 'react-three-fiber'
import {
  AppStore,
  doSetCameraSpherical,
  getCameraSpherical,
  GlProvider,
  useAppDispatch,
} from 'src'
import { OrthographicCamera } from 'three'

import { GlCameraControls } from './camera-controls'

const CameraControls =
  typeof window !== 'undefined' ? require('camera-controls').default : null

export function GlCameraSpherical() {
  return (
    <CameraSphericalContainer>
      <CameraSphericalWidget />
    </CameraSphericalContainer>
  )
}

interface CameraSphericalContainerProps {
  children: React.ReactNode
}

function CameraSphericalContainer(props: CameraSphericalContainerProps) {
  const { children } = props

  const store: AppStore = useStore()

  return (
    <Canvas orthographic colorManagement>
      <GlProvider store={store}>{children}</GlProvider>
    </Canvas>
  )
}

export function CameraSphericalWidget() {
  const dispatch = useAppDispatch()
  const cameraSpherical = useSelector(getCameraSpherical)

  const controlsRef = useRef<CameraControlsType>(null)
  const [isControlling, setIsControlling] = useState<boolean>(false)

  const canvasContext = useThree()

  const { size } = canvasContext
  const camera = canvasContext.camera as OrthographicCamera

  useEffect(() => {
    const controls = controlsRef.current
    if (controls == null) return

    controls.mouseButtons.left = CameraControls.ACTION.ROTATE
    controls.mouseButtons.right = CameraControls.ACTION.NONE
    controls.mouseButtons.wheel = CameraControls.ACTION.NONE

    controls.addEventListener('controlstart', handleControlStart)
    controls.addEventListener('control', handleControl)
    controls.addEventListener('controlend', handleControlEnd)

    return () => {
      controls.removeEventListener('controlstart', handleControlStart)
      controls.removeEventListener('control', handleControl)
      controls.removeEventListener('controlend', handleControlEnd)
    }

    function handleControlStart() {
      setIsControlling(true)
    }

    function handleControl() {
      if (controls == null) return

      dispatch(
        doSetCameraSpherical({
          polar: controls.polarAngle,
          azimuth: controls.azimuthAngle,
        }),
      )
    }

    function handleControlEnd() {
      setIsControlling(false)
    }
  }, [controlsRef, dispatch, setIsControlling])

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
    controls.zoomTo(4)
    camera.updateProjectionMatrix()
  }, [camera, controlsRef, size])

  useEffect(() => {
    const controls = controlsRef.current
    if (controls == null) return

    if (!isControlling) {
      controls.polarAngle = cameraSpherical.polar
      controls.azimuthAngle = cameraSpherical.azimuth
    }
  }, [controlsRef, cameraSpherical, isControlling])

  return (
    <>
      <GlCameraControls ref={controlsRef} />
      <axesHelper args={[5]} />
    </>
  )
}
