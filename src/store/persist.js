import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import produce from 'immer'
import { values } from 'lodash'
import { inflateRaw, deflateRaw, Z_BEST_COMPRESSION } from 'pako'

import { doSetParts, doSetCurrentSpecId } from './'
import { axisToDirection, directionToAxis } from '../helpers/direction'
import Codec from '../codec'

export const doAsyncLoadModel = createAsyncThunk(
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
          'gridbeam-editor/stores/model: could not decompress model with gzip'
        )
      }

      try {
        var model = Codec.Model.decode(Buffer.from(modelBuffer))
      } catch (err) {
        console.error(err)
        throw new Error(
          'gridbeam-editor/stores/model: could not parse model from protocol buffer'
        )
      }

      var { parts, specId } = model

      parts = parts.map(inflatePart)

      dispatch(doSetParts(parts))
      dispatch(doSetCurrentSpecId(specId))
    } else {
      throw new Error(`Unexpected version: ${version}`)
    }

    dispatch(doSetLoadStatus('loaded'))
  }
)

export const doAsyncSaveModel = createAsyncThunk(
  'persist/saveModel',
  async ({ parts, specId }, { dispatch }) => {
    const version = 1

    parts = values(parts).map(deflatePart)

    const model = {
      specId,
      parts
    }

    try {
      var modelBuffer = Codec.Model.encode(model)
    } catch (err) {
      console.error(err)
      throw new Error(
        'gridbeam-editor/stores/model: could not encode model as protocol buffer'
      )
    }
    try {
      var modelCompressed = deflateRaw(Buffer.from(modelBuffer), {
        level: Z_BEST_COMPRESSION
      })
    } catch (err) {
      console.error(err)
      throw new Error(
        'gridbeam-editor/stores/model: could not compress model with gzip'
      )
    }

    const modelBase64 = Base64.encode(modelCompressed)

    const hash = '#' + version + modelBase64

    dispatch(doSetSavedHash(hash))

    window.location.href = window.location.href.split('#')[0] + hash
  }
)

export const persistSlice = createSlice({
  name: 'persist',
  initialState: {
    status: 'dirty',
    savedHash: ''
  },
  reducers: {
    doSetLoadStatus: (state, action) => {
      state.status = action.payload
    },
    doSetSavedHash: (state, action) => {
      state.savedHash = action.payload
    }
  }
})

export const { doSetLoadStatus, doSetSavedHash } = persistSlice.actions
export default persistSlice.reducer

export const getPersistState = state => state.persist

export const getIsLoading = createSelector(
  getPersistState,
  persist => persist.status === 'loading'
)

export const getIsLoaded = createSelector(
  getPersistState,
  persist => persist.status === 'loaded'
)

export const getSavedHash = createSelector(
  getPersistState,
  persist => persist.savedHash
)

// based on https://github.com/joaquimserafim/base64-url/blob/master/index.js
const Base64 = {
  unescape (str) {
    return (str + '==='.slice((str.length + 3) % 4))
      .replace(/-/g, '+')
      .replace(/_/g, '/')
  },
  escape (str) {
    return str
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  },
  encode (str, encoding = 'utf8') {
    return this.escape(Buffer.from(str, encoding).toString('base64'))
  },

  decode (str, encoding = 'utf8') {
    return Buffer.from(this.unescape(str), 'base64')
  }
}

const inflatePart = produce(part => {
  if (part.axisDirection != null) {
    part.direction = axisToDirection(part.axisDirection)
    delete part.axisDirection
  }
})

const deflatePart = produce(part => {
  if (part.direction != null) {
    const axisDirection = directionToAxis(part.direction)
    if (axisDirection != null) {
      part.axisDirection = axisDirection
      delete part.direction
    }
  }
})
