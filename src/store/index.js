import { combineReducers, configureStore } from '@reduxjs/toolkit'

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
