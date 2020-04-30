import { createSlice, createSelector } from '@reduxjs/toolkit'

export const cameraSlice = createSlice({
  name: 'camera',
  initialState: {
    controlEnabled: true
  },
  reducers: {
    doEnableCameraControl: state => {
      state.controlEnabled = true
    },
    doDisableCameraControl: state => {
      state.controlEnabled = false
    }
  }
})

export const {
  doEnableCameraControl,
  doDisableCameraControl
} = cameraSlice.actions

export default cameraSlice.reducer

export const getCameraState = state => state.camera

export const getIsCameraControlEnabled = createSelector(
  getCameraState,
  cameraState => cameraState.controlEnabled
)
