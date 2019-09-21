import produce from 'immer'
import { Math as ThreeMath } from 'three'
import {
  complement,
  filter,
  equals,
  keys,
  isEmpty,
  groupBy,
  pipe,
  prop,
  zipObj
} from 'ramda'

export const rotationByDirection = {
  x: { inclination: 0, azimuth: 0 },
  y: { inclination: Math.PI / 2, azimuth: 0 },
  z: { inclination: 0, azimuth: -Math.PI / 2 }
}

export let parts = {
  name: 'parts',
  state: {
    parts: null,
    isMoving: false
  },
  reducers: {
    setMoving: produce((state, isMoving) => {
      state.isMoving = isMoving
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
  effects: dispatch => ({}),
  selectors: (slice, createSelector) => ({
    isMoving: () => slice(prop('isMoving')),
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
    if (value.origin.z < 0) value.origin.z = 0
  }
}
