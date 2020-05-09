import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getInputModifiers } from '../store'

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

  useEffect(() => {
    if (controls == null) return

    if (modifiers.alt) {
      if (modifiers.shift) {
        controls.mouseButtons.left = CameraControls.ACTION.TRUCK
      } else {
        controls.mouseButtons.left = CameraControls.ACTION.ROTATE
      }
    } else {
      controls.mouseButtons.left = CameraControls.ACTION.NONE
      controls.mouseButtons.right = CameraControls.ACTION.NONE
      controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM
    }
  }, [controls, modifiers])
}
