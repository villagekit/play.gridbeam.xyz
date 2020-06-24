import {
  ActionReducerMapBuilder,
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import produce, { original } from 'immer'
import {
  capitalize,
  clone,
  forEach,
  groupBy,
  isEmpty,
  keys,
  pick,
  values,
  zipObject,
} from 'lodash'
import { createObjectSelector } from 'reselect-map'
import {
  directionToQuaternion,
  getCurrentSpecMaterials,
  getCurrentSpecSizes,
  MaterialId,
  RootState,
  SizeId,
  SpecMaterialSizeValue,
  SpecMaterialValue,
  SpecSizeValue,
} from 'src'
import { MathUtils, Quaternion } from 'three'
import removeFromUnorderedArray from 'unordered-array-remove'

import { Direction } from './helpers/direction'
import {
  createEmptyPartUpdate,
  PartUpdate,
  updatePart,
  updateParts,
} from './helpers/updater'

export enum PartType {
  Beam = 0,
  Skin = 1,
  Fastener = 2,
  Accessory = 3,
  Adapter = 4,
}

export interface GridPosition {
  x: number
  y: number
  z: number
}

export type Length = number

export interface PartEntity {
  type: PartType
  origin: GridPosition
  sizeId: SizeId
  materialId: MaterialId
  direction: Direction
  // axisDirection?: AxisDirection
  length: Length
}

export type Uuid = string

// TODO we aren't handling a transition of different spec sizes
export type PartTransition = PartUpdate

export interface PartValue extends PartEntity {
  uuid: Uuid
  name: string
  shortId: string
  isHovered: boolean
  isSelected: boolean
  isTransitioning: boolean
  stateBeforeTransition: null | PartEntity
  transition: null | PartTransition
  specMaterial: SpecMaterialValue
  specMaterialSize: SpecMaterialSizeValue
  specSize: SpecSizeValue
  beamWidth: number
  holeDiameter: number
  boltDiameter: number
  position: [number, number, number]
  quaternion: Quaternion
}

type HoverStateKey = 'hoveredUuids'
type SelectStateKey = 'selectedUuids'
type HappenStateKey = HoverStateKey | SelectStateKey
type HappenStateValue = Array<Uuid>
type HappenState = Record<HappenStateKey, HappenStateValue>

interface PartUpdateHistoryForUndo {
  update: PartUpdate
  stateBeforeUpdate: null | Record<Uuid, PartEntity>
}

interface PartUpdateHistoryForRedo {
  update: PartUpdate
}

// or maybe Undo should reference a PartUpdate
// where a PartUpdate can update one or more parts
// then an Undo would be the Set updates for the parts
// to re-set them to their state before the transition.
// ---
// given the transition update,
// iterate through each selected part,
// flatten the update, iterate through each path
// get the previous state
// get the next state
// create a reverse set update for that path back to previous state
// set the next state

export type PartsState = {
  entities: null | Record<Uuid, PartEntity>
  currentTransition: null | PartTransition
  clipboard: Array<PartEntity>
  updateHistory: {
    undos: Array<PartUpdateHistoryForUndo>
    redos: Array<PartUpdateHistoryForRedo>
  }
} & HappenState

const hoverHappening = buildPartHappening<HoverStateKey>(
  'hover',
  'hoveredUuids',
)
const selectHappening = buildPartHappening<SelectStateKey>(
  'select',
  'selectedUuids',
)

const initialState: PartsState = {
  entities: null,
  currentTransition: null,
  clipboard: [],
  updateHistory: {
    undos: [],
    redos: [],
  },
  hoveredUuids: hoverHappening.initialState,
  selectedUuids: selectHappening.initialState,
}

// for undos
function helpUndosBeforePartUpdate(state: PartsState, update: PartUpdate) {
  if (state.entities === null) state.entities = {}
  const undo: PartUpdateHistoryForUndo = {
    stateBeforeUpdate: null,
    update,
  }

  switch (update.type) {
    case 'move':
    case 'scale':
    case 'rotate':
    case 'delete':
      undo.stateBeforeUpdate = {}
      update.payload.uuids.forEach((uuid: Uuid) => {
        // @ts-ignore
        undo.stateBeforeUpdate[uuid] = original(state.entities[uuid])
      })
      break
  }

  state.updateHistory.undos.push(undo)
}

function helpDeleteSelected(state: PartsState, update: PartUpdate) {
  // TODO figure out where this code should go...
  // if delete, then remove any deleted if selected
  if (update.type === 'delete') {
    state.selectedUuids = state.selectedUuids.filter((uuid) => {
      return !update.payload.uuids.includes(uuid)
    })
  }
}

export const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    doSetParts: (
      state: PartsState,
      action: PayloadAction<Array<PartEntity>>,
    ) => {
      const parts = action.payload
      const uuids = parts.map((part) => MathUtils.generateUUID())
      state.entities = zipObject(uuids, parts) as PartsState['entities']
    },
    doUpdateParts: (state: PartsState, action: PayloadAction<PartUpdate>) => {
      if (state.entities === null) state.entities = {}
      const update = action.payload

      // setup undo / redo
      helpUndosBeforePartUpdate(state, update)
      state.updateHistory.redos = []

      // apply update
      updateParts(state.entities, update)
      helpDeleteSelected(state, update)
    },
    doStartPartTransition: (
      state: PartsState,
      action: PayloadAction<PartTransition['type']>,
    ) => {
      state.currentTransition = createEmptyPartUpdate(action.payload)
    },
    doUpdatePartTransition: (
      state: PartsState,
      action: PayloadAction<PartTransition['payload']>,
    ) => {
      if (state.currentTransition == null)
        throw new Error('cannot update transition without start')
      state.currentTransition.payload = action.payload
    },
    doEndPartTransition: (state: PartsState) => {
      if (state.currentTransition == null)
        throw new Error('cannot end transition without start')
      if (state.entities === null) state.entities = {}
      const { entities, currentTransition } = state
      if (currentTransition.payload == null) return

      const update = currentTransition as PartUpdate

      // setup undo / redo
      helpUndosBeforePartUpdate(state, update)
      state.updateHistory.redos = []

      // apply transition update
      updateParts(entities, update)

      state.currentTransition = null
    },
    doSetPartsClipboard: (
      state: PartsState,
      action: PayloadAction<Array<PartEntity>>,
    ) => {
      state.clipboard = action.payload
    },
    doUndoPartUpdate: (state: PartsState) => {
      if (state.entities === null) state.entities = {}
      const lastUndoUpdateHistory = state.updateHistory.undos.pop()
      if (lastUndoUpdateHistory == null) return
      const { update, stateBeforeUpdate } = lastUndoUpdateHistory

      let reverseUpdate: null | PartUpdate = null
      switch (update.type) {
        case 'move':
        case 'scale':
        case 'rotate':
          if (stateBeforeUpdate == null) return
          forEach(state.entities, (currentState: PartEntity, uuid: Uuid) => {
            if (uuid in stateBeforeUpdate) {
              Object.assign(currentState, stateBeforeUpdate[uuid])
            }
          })
          break
        case 'create':
          reverseUpdate = {
            type: 'delete',
            payload: {
              uuids: update.payload.uuids,
            },
          }
          break
        case 'delete':
          if (stateBeforeUpdate == null) return
          reverseUpdate = {
            type: 'create',
            payload: {
              uuids: update.payload.uuids,
              parts: values(stateBeforeUpdate),
            },
          }
          break
      }

      if (reverseUpdate != null) {
        updateParts(state.entities, reverseUpdate)
        helpDeleteSelected(state, reverseUpdate)
      }

      state.updateHistory.redos.push({ update })
    },
    doRedoPartUpdate: (state: PartsState) => {
      if (state.entities === null) state.entities = {}
      const lastRedoUpdateHistory = state.updateHistory.redos.pop()
      if (lastRedoUpdateHistory == null) return
      const { update } = lastRedoUpdateHistory
      helpUndosBeforePartUpdate(state, update)
      updateParts(state.entities, update)
      helpDeleteSelected(state, update)
    },
  },
  extraReducers: (builder) => {
    hoverHappening.buildReducers(builder)
    selectHappening.buildReducers(builder)
  },
})

export const {
  doHappenAction: doHoverPart,
  doUnhappenAction: doUnhoverPart,
  doHappensAction: doHoverParts,
} = hoverHappening.actions

export const {
  doHappenAction: doSelectPart,
  doUnhappenAction: doUnselectPart,
  doHappensAction: doSelectParts,
} = selectHappening.actions

export const {
  doSetParts,
  doUpdateParts,
  doStartPartTransition,
  doUpdatePartTransition,
  doEndPartTransition,
  doSetPartsClipboard,
  doUndoPartUpdate,
  doRedoPartUpdate,
} = partsSlice.actions

export default partsSlice.reducer

export const getPartsState = (state: RootState): PartsState => state.parts
export const getHoveredUuids = createSelector(
  getPartsState,
  (state) => state.hoveredUuids,
)
export const getSelectedUuids = createSelector(
  getPartsState,
  (state) => state.selectedUuids,
)
export const getPartsEntities = createSelector(
  getPartsState,
  (state) => state.entities,
)
export const getCurrentPartTransition = createSelector(
  getPartsState,
  (state) => state.currentTransition,
)
/*
export const getPartUndos = createSelector(
  getPartsState,
  (state) => state.undos,
)
*/
export const getIsPartTransitioning = createSelector(
  getCurrentPartTransition,
  (currentTransition) => currentTransition != null,
)
export const getPartsUuids = createSelector(
  getPartsEntities,
  (parts): Array<Uuid> => keys(parts),
)
// HACK to ensure reselect-map always has an object
export const getPartsEntitiesNotNull = createSelector(
  getPartsEntities,
  (entities) => entities || {},
)
export const getPartsByUuid = createObjectSelector(
  getPartsEntitiesNotNull,
  getHoveredUuids,
  getSelectedUuids,
  getCurrentPartTransition,
  getCurrentSpecSizes,
  getCurrentSpecMaterials,
  (
    part,
    hoveredUuids,
    selectedUuids,
    currentTransition,
    currentSpecSizes,
    currentSpecMaterials,
    uuid,
  ): PartValue => {
    const name = getPartNameByType(part.type)
    const shortId = getPartShortId(uuid)

    const isHovered = hoveredUuids.includes(uuid)
    const isSelected = selectedUuids.includes(uuid)

    const { sizeId, materialId } = part
    const specSize = currentSpecSizes[sizeId]
    const specMaterial = currentSpecMaterials[materialId]
    const specMaterialSize = specMaterial.sizes[sizeId]
    const beamWidth = specSize.normalizedBeamWidth
    const holeDiameter = specMaterialSize.normalizedHoleDiameter
    const boltDiameter = specMaterialSize.normalizedBoltDiameter

    let value: PartEntity & Partial<PartValue> = Object.assign({}, part, {
      uuid,
      name,
      shortId,
      isHovered,
      isSelected,
      transition: null,
      stateBeforeTransition: null,
      specSize,
      specMaterial,
      specMaterialSize,
      beamWidth,
      holeDiameter,
      boltDiameter,
    })

    let isTransitioning = false
    if (currentTransition) {
      // @ts-ignore
      isTransitioning = currentTransition?.payload?.uuids.includes(uuid)
    }

    if (currentTransition && isTransitioning) {
      value.isTransitioning = true
      value.transition = currentTransition
      value.stateBeforeTransition = part

      if (currentTransition.payload != null) {
        const update = currentTransition as PartUpdate
        const nextPart = produce<PartEntity>(part, (draft) => {
          updatePart(draft, update)
        })
        Object.assign(value, nextPart)
      }
    }

    const { origin, direction } = value
    value.position = [
      (1 / 2 + origin.x) * beamWidth,
      (1 / 2 + origin.y) * beamWidth,
      (1 / 2 + origin.z) * beamWidth,
    ]
    value.quaternion = directionToQuaternion(direction)

    return value as PartValue
  },
)
export const getParts = createSelector(
  getPartsByUuid,
  (partsByUuid): Array<PartValue> => values(partsByUuid),
)
export const getSelectedPartsEntities = createSelector(
  getPartsEntities,
  getSelectedUuids,
  (parts, selectedUuids) =>
    pick(parts, selectedUuids) as Record<Uuid, PartEntity>,
)
export const getSelectedParts = createSelector(getParts, (parts) =>
  parts.filter((part) => part.isSelected === true),
)
export const getTransitioningParts = createSelector(getParts, (parts) =>
  parts.filter((part) => part.isTransitioning === true),
)
export const getHasSelectedAnyParts = createSelector(
  getSelectedUuids,
  (selectedUuids) => !isEmpty(selectedUuids),
)
export const getPartsByType = createSelector(getParts, (parts) => {
  return groupBy(parts, 'type')
})
export const getPartsClipboard = createSelector(
  getPartsState,
  (state) => state.clipboard,
)

function buildPartHappening<StateKey extends HappenStateKey>(
  happen: string,
  stateKey: StateKey,
) {
  const doHappenAction = createAction<Uuid>(`parts/do${capitalize(happen)}Part`)
  const doUnhappenAction = createAction<Uuid>(`parts/doUn${happen}Part`)
  const doHappensAction = createAction<Array<Uuid>>(
    `parts/do${capitalize(happen)}Parts`,
  )

  const initialState: HappenStateValue = []

  const actions = { doHappenAction, doUnhappenAction, doHappensAction }

  const buildReducers = (builder: ActionReducerMapBuilder<PartsState>) => {
    builder.addCase(
      doHappenAction,
      (state: PartsState, action: PayloadAction<Uuid>) => {
        const uuid: Uuid = action.payload
        const happenState: HappenStateValue = state[stateKey]
        happenState.push(uuid)
      },
    )

    builder.addCase(
      doUnhappenAction,
      (state: PartsState, action: PayloadAction<Uuid>) => {
        const uuid = action.payload
        const happenState = state[stateKey]
        removeFromSet<Uuid>(happenState, uuid)
      },
    )

    builder.addCase(
      doHappensAction,
      (state: PartsState, action: PayloadAction<Array<Uuid>>) => {
        const uuids = action.payload
        const happenState: HappenStateValue = state[stateKey]
        const happenedUuids: Array<Uuid> = clone(happenState)
        // remove any uuids no longer happening
        happenedUuids.forEach((uuid) => {
          if (!uuids.includes(uuid)) {
            removeFromSet<Uuid>(happenState, uuid)
          }
        })
        // add any uuids that started happening
        uuids.forEach((uuid) => {
          if (!happenedUuids.includes(uuid)) {
            happenState.push(uuid)
          }
        })
      },
    )
  }

  return {
    initialState,
    actions,
    buildReducers,
  }
}

function removeFromSet<T>(array: Array<T>, item: T) {
  removeFromUnorderedArray(array, array.indexOf(item))
}

function getPartShortId(uuid: Uuid) {
  return uuid.substring(0, 5)
}

function getPartNameByType(type: PartType): string {
  switch (type) {
    case PartType.Beam:
      return 'beam'
    case PartType.Skin:
      return 'skin'
    case PartType.Fastener:
      return 'fastener'
    case PartType.Accessory:
      return 'accessory'
    case PartType.Adapter:
      return 'adapter'
  }
}
