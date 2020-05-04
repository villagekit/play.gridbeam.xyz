import { createAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { MathUtils } from 'three'
import {
  capitalize,
  groupBy,
  isEmpty,
  keys,
  map,
  property,
  zipObject,
} from 'lodash'

import createUpdater from '../helpers/updater'

const hoverHappening = buildPartHappening('hover')
const selectHappening = buildPartHappening('select')

export const partsSlice = createSlice({
  name: 'parts',
  initialState: {
    entities: null,
    isMoving: false,
    ...hoverHappening.initialState,
    ...selectHappening.initialState,
  },
  reducers: {
    doSetAnyPartIsMoving: (state, action) => {
      state.isMoving = action.payload
    },
    doSetParts: (state, action) => {
      const parts = action.payload
      const uuids = parts.map((part) => MathUtils.generateUUID())
      state.entities = zipObject(uuids, parts)
    },
    doAddPart: (state, action) => {
      const uuid = MathUtils.generateUUID()
      state.entities[uuid] = action.payload
    },
    doAddParts: (state, action) => {
      const newParts = action.payload
      newParts.forEach((newPart) => {
        const uuid = MathUtils.generateUUID()
        state.entities[uuid] = newPart
      })
    },
    doUpdatePart: (state, action) => {
      const { uuid, updater } = action.payload
      const safeUpdater = SafeUpdater(createUpdater(updater))
      safeUpdater(state.entities[uuid])
    },
    doUpdateSelectedParts: (state, action) => {
      const updater = action.payload
      const safeUpdater = SafeUpdater(createUpdater(updater))
      const { selectedUuids } = state
      keys(selectedUuids).forEach((uuid) => {
        safeUpdater(state.entities[uuid])
      })
    },
    doRemoveSelectedParts: (state) => {
      const { selectedUuids } = state
      keys(selectedUuids).forEach((uuid) => {
        delete state.entities[uuid]
      })
    },
  },
  extraReducers: (builder) => {
    hoverHappening.buildReducers(builder)
    selectHappening.buildReducers(builder)
  },
})

export const {
  doHoverPart,
  doUnhoverPart,
  doHoverParts,
} = hoverHappening.actions

export const {
  doSelectPart,
  doUnselectPart,
  doSelectParts,
} = selectHappening.actions

export const {
  doSetAnyPartIsMoving,
  doSetParts,
  doAddPart,
  doAddParts,
  doUpdatePart,
  doUpdateSelectedParts,
  doRemoveSelectedParts,
} = partsSlice.actions

export default partsSlice.reducer

export const getPartsState = property('parts')
export const getAnyPartIsMoving = createSelector(
  getPartsState,
  property('isMoving'),
)
export const getHoveredUuids = createSelector(
  getPartsState,
  property('hoveredUuids'),
)
export const getSelectedUuids = createSelector(
  getPartsState,
  property('selectedUuids'),
)
export const getPartsEntities = createSelector(
  getPartsState,
  property('entities'),
)
export const getParts = createSelector(
  getPartsEntities,
  getHoveredUuids,
  getSelectedUuids,
  (parts, hoveredUuids, selectedUuids) => {
    parts = parts == null ? {} : parts
    return map(parts, (part, uuid) =>
      Object.assign({}, part, {
        uuid,
        isHovered: Boolean(uuid in hoveredUuids),
        isSelected: Boolean(uuid in selectedUuids),
      }),
    )
  },
)
export const getSelectedParts = createSelector(getParts, (parts) =>
  parts.filter((part) => part.isSelected === true),
)
export const getHasSelectedAnyParts = createSelector(
  getSelectedUuids,
  (selectedUuids) => !isEmpty(selectedUuids),
)
export const getPartsByType = createSelector(getParts, (parts) => {
  return groupBy(parts, 'type')
})

function buildPartHappening(happen) {
  const happenAction = createAction(`parts/do${capitalize(happen)}Part`)
  const happensAction = createAction(`parts/do${capitalize(happen)}Parts`)
  const unhappenAction = createAction(`parts/doUn${happen}Part`)

  const initialState = { [`${happen}edUuids`]: {} }

  const actions = {
    [`do${capitalize(happen)}Part`]: happenAction,
    [`doUn${happen}Part`]: unhappenAction,
    [`do${capitalize(happen)}Parts`]: happensAction,
  }

  const buildReducers = (builder) => {
    builder.addCase(happenAction, (state, action) => {
      const uuid = action.payload
      state[`${happen}edUuids`][uuid] = true
    })

    builder.addCase(unhappenAction, (state, action) => {
      const uuid = action.payload
      delete state[`${happen}edUuids`][uuid]
    })

    builder.addCase(happensAction, (state, action) => {
      const uuids = action.payload
      const happenedUuidsObject = state[`${happen}edUuids`]
      const happenedUuids = keys(happenedUuidsObject)
      // remove any uuids no longer happening
      happenedUuids.forEach((uuid) => {
        if (!uuids.includes(uuid)) {
          delete happenedUuidsObject[uuid]
        }
      })
      // add any uuids that started happening
      uuids.forEach((uuid) => {
        if (!happenedUuids.includes(uuid)) {
          happenedUuidsObject[uuid] = true
        }
      })
    })
  }

  return {
    initialState,
    actions,
    buildReducers,
  }
}

function SafeUpdater(updater) {
  return (value) => {
    updater(value)
    if (value.length < 1) value.length = 1
    if (value.origin.z < 0) value.origin.z = 0
  }
}
