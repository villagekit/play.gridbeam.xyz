import { createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'src'

export interface CameraState {
  controlEnabled: boolean
}

export interface SceneState {
  camera: CameraState
}

const initialState: SceneState = {
  camera: {
    controlEnabled: true,
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
  },
})

export const {
  doEnableCameraControl,
  doDisableCameraControl,
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
