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

    const partsUriComponent = window.location.href.split('#')[1]
    if (partsUriComponent == null) return

    try {
      var partsJson = decompressFromEncodedURIComponent(partsUriComponent)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/parts: could not parse parts from Base64 in Url'
      )
    }

    try {
      var parts = JSON.parse(partsJson)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/parts: could not parse parts from Json in Url'
      )
    }

    return setParts(parts)
  },
  saveParts: parts => {
    const partsOut = values(parts)

    try {
      var partsJson = JSON.stringify(partsOut)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/parts: could not stringify Json parts'
      )
    }
    try {
      var partsBase64 = compressToEncodedURIComponent(partsJson)
    } catch (err) {
      throw new Error(
        'gridbeam-editor/stores/parts: could not stringify Base64 parts'
      )
    }

    window.location.href =
      window.location.href.split('#')[0] + '#' + partsBase64
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
