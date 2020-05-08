import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '../store'

export enum ModifierKey {
  shift = 'shift',
  alt = 'alt',
  ctrl = 'ctrl',
}

export interface InputState {
  // handedness (right or left)

  // keyboard

  modifiers: Record<ModifierKey, boolean>
}

const initialState: InputState = {
  modifiers: {
    shift: false,
    alt: false,
    ctrl: false,
  },
}

export const inputSlice = createSlice({
  name: 'input',
  initialState,
  reducers: {
    doSetModifier: (
      state: InputState,
      action: PayloadAction<{
        key: ModifierKey
        value: boolean
      }>,
    ) => {
      const { key, value } = action.payload
      state.modifiers[key] = value
    },
  },
})

export const { doSetModifier } = inputSlice.actions

export default inputSlice.reducer

export const getInputState = (state: RootState): InputState => state.input
export const getInputModifiers = createSelector(
  getInputState,
  (state) => state.modifiers,
)
