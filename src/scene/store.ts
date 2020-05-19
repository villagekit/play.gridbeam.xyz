import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type CameraControlsType from 'camera-controls'
import { AppDispatch, RootState } from 'src'

export interface CameraState {
  controlEnabled: boolean
  controlMode: CameraControlMode
  controlReady: boolean
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
    controlReady: false,
  },
}

// NOTE: storing in the state caused an infinite loop bug with immer.
let cameraControls: CameraControlsType | null = null

export const doSetCameraControls = (
  nextCameraControls: typeof cameraControls,
) => (dispatch: AppDispatch) => {
  cameraControls = nextCameraControls
  dispatch(doSetCameraControlReady(true))
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
    doSetCameraControlReady: (state, action: PayloadAction<boolean>) => {
      state.camera.controlReady = action.payload
    },
  },
})

export const {
  doEnableCameraControl,
  doDisableCameraControl,
  doSetCameraControlMode,
  doSetCameraControlReady,
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

export const getCameraControlReady = createSelector(
  getCameraState,
  (cameraState: CameraState) => cameraState.controlReady,
)

export const getCameraControls = createSelector(
  getCameraControlReady,
  () => cameraControls,
)
