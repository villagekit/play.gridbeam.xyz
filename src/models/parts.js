import produce from 'immer'
import { Math as ThreeMath } from 'three'
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent
} from 'lz-string'
import {
  complement,
  filter,
  equals,
  keys,
  isEmpty,
  groupBy,
  pipe,
  prop,
  values,
  zipObj
} from 'ramda'

export let parts = {
  name: 'parts',
  state: {
    parts: null,
    isLoaded: false,
    isMoving: false,
    savedHash: ''
  },
  reducers: {
    setLoaded: produce((state, isLoaded) => {
      state.isLoaded = isLoaded
    }),
    setMoving: produce((state, moving) => {
      state.isMoving = moving
    }),
    setSavedHash: produce((state, hash) => {
      state.savedHash = hash
    }),
    setParts: produce((state, parts) => {
      const uuids = parts.map(part => ThreeMath.generateUUID())
      state.parts = zipObj(uuids, parts)
    }),
    addPart: produce((state, newPart) => {
      const uuid = ThreeMath.generateUUID()
      state.parts[uuid] = newPart
    }),
    addParts: produce((state, newParts) => {
      newParts.forEach(newPart => {
        const uuid = ThreeMath.generateUUID()
        state.parts[uuid] = newPart
      })
    }),
    update: produce((state, { uuid, updater }) => {
      const safeUpdater = SafeUpdater(updater)
      safeUpdater(state.parts[uuid])
    }),
    updateSelected: produce((state, updater) => {
      const safeUpdater = SafeUpdater(updater)
      const { selectedUuids } = state
      keys(selectedUuids).forEach(uuid => {
        safeUpdater(state.parts[uuid])
      })
    }),
    removeSelected: produce(state => {
      const { selectedUuids } = state
      keys(selectedUuids).forEach(uuid => {
        delete state.parts[uuid]
      })
    })
  },
  effects: dispatch => ({
    loadParts: defaultParts => {
      dispatch.parts.setLoaded(true)

      const modelUriComponent = window.location.href.split('#')[1]
      if (modelUriComponent == null) {
        dispatch.parts.setParts(defaultParts)
        return
      }

      const version = Number(modelUriComponent[0])

      if (version === 1) {
        const modelString = modelUriComponent.substring(1)

        try {
          var modelJson = decompressFromEncodedURIComponent(modelString)
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

        dispatch.parts.setParts(parts)
      } else {
        throw new Error(`Unexpected version: ${version}`)
      }
    },
    saveParts: parts => {
      const version = 1

      const model = {
        parts: values(parts)
      }

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

      const hash = '#' + version + modelBase64

      dispatch.parts.setSavedHash(hash)

      window.location.href = window.location.href.split('#')[0] + hash
    }
  }),
  selectors: (slice, createSelector) => ({
    isLoaded: () => slice(prop('isLoaded')),
    isMoving: () => slice(prop('isMoving')),
    savedHash: () => slice(prop('savedHash')),
    hoveredUuids: () => slice(prop('hoveredUuids')),
    selectedUuids: () => slice(prop('selectedUuids')),
    raw: () => slice(prop('parts')),
    all: models =>
      createSelector(
        models.parts.raw,
        models.parts.hoveredUuids,
        models.parts.selectedUuids,
        (parts, hoveredUuids, selectedUuids) => {
          parts = parts == null ? [] : parts
          return Object.entries(parts).map(([uuid, part]) =>
            Object.assign({}, part, {
              uuid,
              isHovered: Boolean(uuid in hoveredUuids),
              isSelected: Boolean(uuid in selectedUuids)
            })
          )
        }
      ),
    selected: models =>
      createSelector(
        models.parts.all,
        filter(
          pipe(
            prop('isSelected'),
            equals(true)
          )
        )
      ),
    hasSelected: models =>
      createSelector(
        models.parts.selectedUuids,
        complement(isEmpty)
      ),
    byType: models =>
      createSelector(
        models.parts.all,
        groupBy(prop('type'))
      )
  })
}

function computeCentroid (parts) {}

createBeamHappening(parts, 'hover')
createBeamHappening(parts, 'select')

// what about a happen for any uuid?
function createBeamHappening (model, happen) {
  model.state[`${happen}edUuids`] = {}
  model.reducers[`${happen}`] = produce((state, uuid) => {
    state[`${happen}edUuids`][uuid] = true
  })
  model.reducers[`${happen}s`] = produce((state, uuids) => {
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
  model.reducers[`un${happen}`] = produce((state, uuid) => {
    delete state[`${happen}edUuids`][uuid]
  })
}

function SafeUpdater (updater) {
  return value => {
    updater(value)
    if (value.length < 1) value.length = 1
    if (value.origin[2] < 0) value.origin[2] = 0
  }
}
