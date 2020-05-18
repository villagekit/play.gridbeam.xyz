import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  CameraControlMode,
  doDisableSelection,
  doEnableSelection,
  getCameraControlMode,
  getInputModifiers,
  useAppDispatch,
} from 'src'

const CameraControls =
  typeof window !== 'undefined' ? require('camera-controls').default : null

// set camera controls, copied from Blender
// - left mouse:
//    - by default: select box (no camera control)
//    - with alt: orbit camera
//    - with alt and shift: truck camera
// - mouse wheel: zoom
// - right mouse: nothing
export const useCameraInput = (controls: typeof CameraControls) => {
  const modifiers = useSelector(getInputModifiers)
  const cameraControlMode = useSelector(getCameraControlMode)

  useEffect(() => {
    if (controls == null) return

    controls.mouseButtons.left = CameraControls.ACTION.NONE
    if (modifiers.alt) {
      if (modifiers.shift) {
        controls.mouseButtons.left = CameraControls.ACTION.TRUCK
      } else {
        controls.mouseButtons.left = CameraControls.ACTION.ROTATE
      }
    }

    controls.mouseButtons.right = CameraControls.ACTION.NONE
    controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM

    switch (cameraControlMode) {
      case 'orbit':
        controls.mouseButtons.left = CameraControls.ACTION.ROTATE
        break
      case 'pan':
        controls.mouseButtons.left = CameraControls.ACTION.TRUCK
        break
      case 'zoom':
        controls.mouseButtons.left = CameraControls.ACTION.ZOOM
        break
    }
  }, [cameraControlMode, controls, modifiers])

  // disable selection when camera control has a non-default mode
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (cameraControlMode !== CameraControlMode.Default) {
      dispatch(doDisableSelection())
    } else {
      dispatch(doEnableSelection())
    }
  }, [cameraControlMode, dispatch])
}
