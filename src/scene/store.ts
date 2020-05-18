import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'src'

export interface CameraState {
  controlEnabled: boolean
  controlMode: CameraControlMode
}

export interface SceneState {
  camera: CameraState
}

export enum CameraControlMode {
  Default = 'default',
  Orbit = 'orbit',
  Pan = 'pan',
  Zoom = 'zoom',
}

const initialState: SceneState = {
  camera: {
    controlEnabled: true,
    controlMode: CameraControlMode.Default,
  },
}

export const sceneSlice = createSlice({
  name: 'scene',
  initialState,
  reducers: {
    doEnableCameraControl: (state) => {
      state.camera.controlEnabled = true
    },
    doDisableCameraControl: (state) => {
      state.camera.controlEnabled = false
    },
    doSetCameraControlMode: (
      state,
      action: PayloadAction<CameraControlMode>,
    ) => {
      state.camera.controlMode = action.payload
    },
  },
})

export const {
  doEnableCameraControl,
  doDisableCameraControl,
  doSetCameraControlMode,
} = sceneSlice.actions

export default sceneSlice.reducer

export const getSceneState = (state: RootState): SceneState => state.scene
export const getCameraState = createSelector(
  getSceneState,
  (state) => state.camera,
)

export const getIsCameraControlEnabled = createSelector(
  getCameraState,
  (cameraState: CameraState): boolean => cameraState.controlEnabled,
)

export const getCameraControlMode = createSelector(
  getCameraState,
  (cameraState: CameraState): CameraControlMode => cameraState.controlMode,
)
