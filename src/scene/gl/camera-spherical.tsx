import type CameraControlsType from 'camera-controls'
import React, { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useStore } from 'react-redux'
import { Canvas, Dom, useThree } from 'react-three-fiber'
import {
  AppStore,
  doDisableSelection,
  doEnableSelection,
  getCameraControls,
  GlProvider,
  useAppDispatch,
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
} from 'src'
import { Text } from 'theme-ui'
import { Color, OrthographicCamera, Vector3 } from 'three'

import { GlCameraControls } from './camera-controls'

const CameraControls =
  typeof window !== 'undefined' ? require('camera-controls').default : null

const portal = createRef<HTMLDivElement>()

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
    <>
      <div ref={portal} style={{ pointerEvents: 'none' }} />
      <Canvas orthographic colorManagement noEvents>
        <GlProvider store={store}>{children}</GlProvider>
      </Canvas>
    </>
  )
}

export function CameraSphericalWidget() {
  const dispatch = useAppDispatch()
  const appControls = useSelector(getCameraControls)

  const controlsRef = useRef<CameraControlsType>(null)

  const canvasContext = useThree()

  const { size } = canvasContext
  const camera = canvasContext.camera as OrthographicCamera

  const [isControlling, setIsControlling] = useState<boolean>(false)

  // receive updates from app camera controls, unless controlling
  useEffect(() => {
    const widgetControls = controlsRef.current
    if (widgetControls == null || appControls == null) return

    appControls.addEventListener('update', handleUpdate)
    handleUpdate()

    return () => {
      appControls.removeEventListener('update', handleUpdate)
    }

    function handleUpdate() {
      if (widgetControls == null || appControls == null) return
      if (!isControlling) {
        widgetControls.polarAngle = appControls.polarAngle
        widgetControls.azimuthAngle = appControls.azimuthAngle
      }
    }
  }, [appControls, controlsRef, isControlling])

  // send widget control updates to app camera controls
  useEffect(() => {
    const widgetControls = controlsRef.current
    if (widgetControls == null || appControls == null) return

    widgetControls.mouseButtons.left = CameraControls.ACTION.ROTATE
    widgetControls.mouseButtons.right = CameraControls.ACTION.NONE
    widgetControls.mouseButtons.wheel = CameraControls.ACTION.NONE

    widgetControls.addEventListener('controlstart', handleControlStart)
    widgetControls.addEventListener('control', handleControl)
    widgetControls.addEventListener('controlend', handleControlEnd)

    return () => {
      widgetControls.removeEventListener('controlstart', handleControlStart)
      widgetControls.removeEventListener('control', handleControl)
      widgetControls.removeEventListener('controlend', handleControlEnd)
    }

    function handleControlStart() {
      setIsControlling(true)
    }

    function handleControl() {
      if (widgetControls == null || appControls == null) return

      appControls.polarAngle = widgetControls.polarAngle
      appControls.azimuthAngle = widgetControls.azimuthAngle
    }

    function handleControlEnd() {
      setIsControlling(false)
    }
  }, [appControls, controlsRef, dispatch, isControlling, setIsControlling])

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
    if (isControlling) {
      dispatch(doDisableSelection())
    } else {
      dispatch(doEnableSelection())
    }
  }, [dispatch, isControlling])

  return (
    <>
      <GlCameraControls ref={controlsRef} />
      <AxesArrows />
      {/*<axesHelper args={[1]} />*/}
    </>
  )
}

function AxesArrows() {
  return (
    <group>
      <AxisArrow name={'x'} axis={X_AXIS} color="red" />
      <AxisArrow name={'y'} axis={Y_AXIS} color="green" />
      <AxisArrow name={'z'} axis={Z_AXIS} color="blue" />
    </group>
  )
}

interface AxisArrowProps {
  axis: Vector3
  color: string
  name: string
}

function AxisArrow(props: AxisArrowProps) {
  const { axis: direction, color, name } = props

  const length = 0.16
  const origin = useMemo(() => new Vector3(0, 0, 0), [])
  const hex = useMemo(() => new Color(color).getHex(), [color])
  const endPosition = useMemo(() => {
    return direction.clone().multiplyScalar(length)
  }, [direction])

  return (
    <>
      <arrowHelper
        args={[direction, origin, length, hex, length * 0.625, length * 0.3125]}
      />
      <Dom
        portal={portal as React.MutableRefObject<HTMLElement>}
        position={endPosition}
      >
        <Text>{name}</Text>
      </Dom>
    </>
  )
}
