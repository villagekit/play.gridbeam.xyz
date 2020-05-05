import { createSelector, createSlice } from '@reduxjs/toolkit'

import { RootState } from './'

export interface CameraState {
  controlEnabled: boolean
}

const initialState: CameraState = {
  controlEnabled: true,
}

export const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    doEnableCameraControl: (state) => {
      state.controlEnabled = true
    },
    doDisableCameraControl: (state) => {
      state.controlEnabled = false
    },
  },
})

export const {
  doEnableCameraControl,
  doDisableCameraControl,
} = cameraSlice.actions

export default cameraSlice.reducer

export const getCameraState = (state: RootState): CameraState => state.camera

export const getIsCameraControlEnabled = createSelector(
  getCameraState,
  (cameraState: CameraState): boolean => cameraState.controlEnabled,
)
