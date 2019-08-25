const THREE = require('three')
const create = require('./').default
const {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} = require('lz-string')
const { keys, values, zipObj } = require('ramda')

const [useModelStore] = create(set => ({
  parts: null,
  isLoaded: false,
  setLoaded: isLoaded =>
    set(state => {
      state.isLoaded = isLoaded
    }),
  setParts: parts =>
    set(state => {
      const uuids = parts.map(part => THREE.Math.generateUUID())
      state.parts = zipObj(uuids, parts)
    }),
  ...createBeamHappening(set, 'hover'),
  ...createBeamHappening(set, 'select'),
  addPart: newPart =>
    set(state => {
      const uuid = THREE.Math.generateUUID()
      state.parts[uuid] = newPart
    }),
  update: (uuid, updater) => set(state => updater(state.parts[uuid])),
  updateSelected: updater =>
    set(state => {
      const { selectedUuids } = state
      keys(selectedUuids).forEach(uuid => {
        updater(state.parts[uuid])
      })
    }),
  removeSelected: () =>
    set(state => {
      const { selectedUuids } = state
      keys(selectedUuids).forEach(uuid => {
        delete state.parts[uuid]
      })
    }),
  loadParts: (setParts, setLoaded) => {
    setLoaded(true)

    const modelUriComponent = window.location.href.split('#')[1]
    if (modelUriComponent == null) return

    try {
      var modelJson = decompressFromEncodedURIComponent(modelUriComponent)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/model: could not parse model from Base64 in Url'
      )
    }

    try {
      var model = JSON.parse(modelJson)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/model: could not parse model from Json in Url'
      )
    }

    const { parts } = model

    return setParts(parts)
  },
  saveParts: (parts, setHash) => {
    const model = { parts: values(parts) }

    try {
      var modelJson = JSON.stringify(model)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/model: could not stringify Json model'
      )
    }
    try {
      var modelBase64 = compressToEncodedURIComponent(modelJson)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/model: could not stringify Base64 model'
      )
    }

    const hash = '#' + modelBase64

    if (setHash) setHash(hash)

    window.location.href = window.location.href.split('#')[0] + hash
  }
}))

module.exports = useModelStore

// what about a happen for any uuid?
function createBeamHappening (set, happen) {
  return {
    [`${happen}edUuids`]: {},
    [`${happen}`]: uuid => {
      return set(state => {
        state[`${happen}edUuids`][uuid] = true
      })
    },
    [`${happen}s`]: uuids => {
      return set(state => {
        var happenedUuidsObject = state[`${happen}edUuids`]
        var happenedUuids = Object.keys(happenedUuidsObject)
        // remove any uuids no longer happening
        happenedUuids.forEach(uuid => {
          if (!uuids.includes(uuid)) {
            delete happenedUuidsObject[uuid]
          }
        })
        // add any uuids that started happening
        uuids.forEach(uuid => {
          if (!happenedUuids.includes(uuid)) {
            happenedUuidsObject[uuid] = true
          }
        })
      })
    },
    [`un${happen}`]: uuid =>
      set(state => {
        delete state[`${happen}edUuids`][uuid]
      })
  }
}
