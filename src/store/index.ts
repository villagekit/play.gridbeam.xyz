import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'

import inputReducer from '../input/store'
import selectionReducer from '../selection/store'
import cameraReducer from './camera'
import partsReducer from './parts'
import persistReducer from './persist'
import specReducer from './spec'

export * from './camera'
export * from './parts'
export * from './persist'
export * from './spec'

export * from '../input/store'
export * from '../selection/store'

const reducer = combineReducers({
  camera: cameraReducer,
  input: inputReducer,
  parts: partsReducer,
  persist: persistReducer,
  selection: selectionReducer,
  spec: specReducer,
})

export function createStore() {
  return configureStore({
    reducer,
  })
}

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<typeof reducer>
export type AppDispatch = AppStore['dispatch']
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
export interface ThunkArg<RejectValue = unknown> {
  dispatch: AppDispatch
  state: RootState
  extra: {}
  rejectValue: RejectValue
}
