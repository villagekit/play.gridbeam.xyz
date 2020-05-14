import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'

import inputReducer from './input/store'
import partsReducer from './parts/store'
import persistReducer from './persist/store'
import sceneReducer from './scene/store'
import selectionReducer from './selection/store'
import specReducer from './spec/store'

export * from './input/store'
export * from './parts/store'
export * from './persist/store'
export * from './scene/store'
export * from './selection/store'
export * from './spec/store'

const reducer = combineReducers({
  scene: sceneReducer,
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
