import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'

import cameraReducer from './camera'
import partsReducer from './parts'
import persistReducer from './persist'
import selectionReducer from './selection'
import specReducer from './spec'

export * from './camera'
export * from './parts'
export * from './persist'
export * from './selection'
export * from './spec'

const reducer = combineReducers({
  camera: cameraReducer,
  parts: partsReducer,
  persist: persistReducer,
  selection: selectionReducer,
  spec: specReducer,
})

export default function createStore() {
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
