import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'src'

export interface CameraState {
  controlEnabled: boolean
  controlMode: CameraControlMode
  spherical: SphericalCoordinate
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

export interface SphericalCoordinate {
  polar: number
  azimuth: number
}

const initialState: SceneState = {
  camera: {
    controlEnabled: true,
    controlMode: CameraControlMode.Default,
    spherical: {
      polar: 0,
      azimuth: 0,
    },
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
    doSetCameraSpherical: (
      state,
      action: PayloadAction<SphericalCoordinate>,
    ) => {
      state.camera.spherical = action.payload
    },
  },
})

export const {
  doEnableCameraControl,
  doDisableCameraControl,
  doSetCameraControlMode,
  doSetCameraSpherical,
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

export const getCameraSpherical = createSelector(
  getCameraState,
  (cameraState: CameraState): SphericalCoordinate => cameraState.spherical,
)
