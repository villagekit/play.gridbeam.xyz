import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import produce from 'immer'
import { values } from 'lodash'
// NOTE: pako exports are overriden in ./src/index.d.ts
import { deflateRaw, inflateRaw, Z_BEST_COMPRESSION } from 'pako'

import Codec from '../codec'
import { axisToDirection, directionToAxis } from '../helpers/direction'
import {
  doSetCurrentSpecId,
  doSetParts,
  PartEntity,
  RootState,
  SpecId,
  ThunkArg,
} from './'

export interface ModelEntity {
  specId: SpecId
  parts: Array<PartEntity>
}

export const doAsyncLoadModel = createAsyncThunk<void, ModelEntity, ThunkArg>(
  'persist/loadModel',
  async (defaultModel, { dispatch }) => {
    dispatch(doSetLoadStatus('loading'))

    const modelUriComponent = window.location.href.split('#')[1]
    if (modelUriComponent == null) {
      dispatch(doSetParts(defaultModel.parts))
      dispatch(doSetCurrentSpecId(defaultModel.specId))
      dispatch(doSetLoadStatus('loaded'))
      return
    }

    const version = Number(modelUriComponent[0])
    const modelString = modelUriComponent.substring(1)

    if (version === 1) {
      const modelBase64 = modelString
      const modelCompressed = Base64.decode(modelBase64)
      try {
        var modelBuffer = inflateRaw(Buffer.from(modelCompressed))
      } catch (err) {
        console.error(err)
        throw new Error(
          'gridbeam-editor/stores/model: could not decompress model with gzip',
        )
      }

      try {
        // @ts-ignore
        var model = Codec.Model.decode(Buffer.from(modelBuffer)) as ModelEntity
      } catch (err) {
        console.error(err)
        throw new Error(
          'gridbeam-editor/stores/model: could not parse model from protocol buffer',
        )
      }

      let { parts, specId } = model

      parts = parts.map(inflatePart)

      dispatch(doSetParts(parts))
      dispatch(doSetCurrentSpecId(specId))
    } else {
      throw new Error(`Unexpected version: ${version}`)
    }

    dispatch(doSetLoadStatus('loaded'))
  },
)

export const doAsyncSaveModel = createAsyncThunk<void, ModelEntity, ThunkArg>(
  'persist/saveModel',
  async ({ parts, specId }, { dispatch }) => {
    const version = 1

    parts = values(parts).map(deflatePart)

    const model = {
      specId,
      parts,
    }

    try {
      // @ts-ignore
      var modelBuffer = Codec.Model.encode(model) as Buffer
    } catch (err) {
      console.error(err)
      throw new Error(
        'gridbeam-editor/stores/model: could not encode model as protocol buffer',
      )
    }
    try {
      var modelCompressed = deflateRaw(Buffer.from(modelBuffer), {
        level: Z_BEST_COMPRESSION,
      })
    } catch (err) {
      console.error(err)
      throw new Error(
        'gridbeam-editor/stores/model: could not compress model with gzip',
      )
    }

    const modelBase64 = Base64.encode(modelCompressed)

    const hash = '#' + version + modelBase64

    dispatch(doSetSavedHash(hash))

    window.location.href = window.location.href.split('#')[0] + hash
  },
)

export interface PersistState {
  loadStatus: 'unloaded' | 'loading' | 'loaded'
  savedHash: string
}

const initialState: PersistState = {
  loadStatus: 'unloaded',
  savedHash: '',
}

export const persistSlice = createSlice({
  name: 'persist',
  initialState,
  reducers: {
    doSetLoadStatus: (
      state: PersistState,
      action: PayloadAction<PersistState['loadStatus']>,
    ) => {
      state.loadStatus = action.payload
    },
    doSetSavedHash: (
      state: PersistState,
      action: PayloadAction<PersistState['savedHash']>,
    ) => {
      state.savedHash = action.payload
    },
  },
})

export const { doSetLoadStatus, doSetSavedHash } = persistSlice.actions
export default persistSlice.reducer

export const getPersistState = (state: RootState): PersistState => state.persist

export const getIsLoading = createSelector(
  getPersistState,
  (persist) => persist.loadStatus === 'loading',
)

export const getIsLoaded = createSelector(
  getPersistState,
  (persist) => persist.loadStatus === 'loaded',
)

export const getSavedHash = createSelector(
  getPersistState,
  (persist) => persist.savedHash,
)

// based on https://github.com/joaquimserafim/base64-url/blob/master/index.js
const Base64 = {
  unescape(str: string): string {
    return (str + '==='.slice((str.length + 3) % 4))
      .replace(/-/g, '+')
      .replace(/_/g, '/')
  },
  escape(str: string): string {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  },
  encode(str: Uint8Array): string {
    return this.escape(Buffer.from(str).toString('base64'))
  },

  decode(str: string) {
    return Buffer.from(this.unescape(str), 'base64')
  },
}

const inflatePart = produce((part) => {
  if (part.axisDirection != null) {
    part.direction = axisToDirection(part.axisDirection)
    delete part.axisDirection
  }
})

const deflatePart = produce((part) => {
  if (part.direction != null) {
    const axisDirection = directionToAxis(part.direction)
    if (axisDirection != null) {
      part.axisDirection = axisDirection
      delete part.direction
    }
  }
})
