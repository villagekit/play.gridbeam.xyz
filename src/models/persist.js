import produce from 'immer'
import { equals, pipe, prop, values } from 'ramda'
import { Ubjson } from '@shelacek/ubjson'
import { promisify } from 'util'
import { gzip, gunzip } from 'zlib'

const compress = promisify(gzip)
const decompress = promisify(gunzip)

export const persist = {
  name: 'persist',
  state: {
    status: 'dirty',
    savedHash: ''
  },
  reducers: {
    setLoadStatus: produce((state, status) => {
      state.status = status
    }),
    setSavedHash: produce((state, hash) => {
      state.savedHash = hash
    })
  },
  effects: dispatch => ({
    async loadParts (defaultParts) {
      this.setLoadStatus('loading')

      const modelUriComponent = window.location.href.split('#')[1]
      if (modelUriComponent == null) {
        dispatch.parts.setParts(defaultParts)
        this.setLoadStatus('loaded')
        return
      }

      const version = Number(modelUriComponent[0])
      const modelString = modelUriComponent.substring(1)

      if (version === 1) {
        const modelBase64 = modelString
        const modelCompressed = Base64.decode(modelBase64)
        try {
          var modelBuffer = await decompress(Buffer.from(modelCompressed))
        } catch (err) {
          console.error(err)
          throw new Error(
            'gridbeam-editor/stores/model: could not decompress model with gzip'
          )
        }

        try {
          var model = Ubjson.decode(modelBuffer)
        } catch (err) {
          console.error(err)
          throw new Error(
            'gridbeam-editor/stores/model: could not parse model from ubjson'
          )
        }

        const { parts } = model
        dispatch.parts.setParts(parts)
      } else {
        throw new Error(`Unexpected version: ${version}`)
      }

      this.setLoadStatus('loaded')
    },
    async saveParts (parts) {
      const version = 1

      const model = {
        parts: values(parts)
      }

      try {
        var modelBuffer = Ubjson.encode(model)
      } catch (err) {
        console.error(err)
        throw new Error(
          'gridbeam-editor/stores/model: could not encode model as ubjson'
        )
      }
      try {
        var modelCompressed = await compress(Buffer.from(modelBuffer))
      } catch (err) {
        console.error(err)
        throw new Error(
          'gridbeam-editor/stores/model: could not compress model with gzip'
        )
      }

      const modelBase64 = Base64.encode(modelCompressed)

      const hash = '#' + version + modelBase64

      this.setSavedHash(hash)

      window.location.href = window.location.href.split('#')[0] + hash
    }
  }),
  selectors: slice => ({
    isLoading: () =>
      slice(
        pipe(
          prop('status'),
          equals('loading')
        )
      ),
    isLoaded: () =>
      slice(
        pipe(
          prop('status'),
          equals('loaded')
        )
      ),
    savedHash: () => slice(prop('savedHash'))
  })
}

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
