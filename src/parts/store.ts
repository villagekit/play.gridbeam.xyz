import {
  ActionReducerMapBuilder,
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import produce from 'immer'
import {
  capitalize,
  clone,
  groupBy,
  isEmpty,
  keys,
  mapValues,
  pick,
  values,
  zipObject,
} from 'lodash'
import { createObjectSelector } from 'reselect-map'
import {
  directionToRotation,
  getCurrentSpecMaterials,
  getCurrentSpecSizes,
  MaterialId,
  RootState,
  SizeId,
  SpecMaterialSizeValue,
  SpecMaterialValue,
  SpecSizeValue,
} from 'src'
import { Euler, MathUtils } from 'three'
import removeFromUnorderedArray from 'unordered-array-remove'

import { Direction } from './helpers/direction'
import { PartUpdate, updatePart, updateParts } from './helpers/updater'

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

// TODO should transition contain uuids affected, or assume selected uuids?
export interface PartTransition {
  type: PartUpdate['type']
  payload: null | PartUpdate['payload']
}

export interface PartValue extends PartEntity {
  uuid: Uuid
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
  rotation: Euler
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
  updateHistory: {
    undos: [],
    redos: [],
  },
  hoveredUuids: hoverHappening.initialState,
  selectedUuids: selectHappening.initialState,
}

// for undo / redo
function helpUndoRedoBeforePartUpdate(state: PartsState, update: PartUpdate) {
  const { entities } = state
  let stateBeforeUpdate = null
  // TODO fix TypeScript here
  // @ts-ignore
  if (update.payload.uuids) {
    // @ts-ignore
    stateBeforeUpdate = pick(entities || {}, update.payload.uuids)
  }
  state.updateHistory.undos.push({
    stateBeforeUpdate,
    update,
  })
  state.updateHistory.redos = []
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
      helpUndoRedoBeforePartUpdate(state, update)
      updateParts(state.entities, update)

      // TODO figure out where this code should go...
      // if delete, then remove any deleted if selected
      if (update.type === 'delete') {
        state.selectedUuids = state.selectedUuids.filter((uuid) => {
          return !update.payload.uuids.includes(uuid)
        })
      }
    },
    doStartPartTransition: (
      state: PartsState,
      action: PayloadAction<PartTransition['type']>,
    ) => {
      state.currentTransition = {
        type: action.payload,
        payload: null,
      }
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

      helpUndoRedoBeforePartUpdate(state, update)

      // apply transition update
      updateParts(entities, update)

      state.currentTransition = null
    },
    doUndoPartUpdate: (state: PartsState) => {
      const lastUndoUpdateHistory = state.updateHistory.undos.pop()
      if (lastUndoUpdateHistory == null) return
      // TODO handle create and delete cases, when stateBeforeUpdate is not relevant
      // @ts-ignore
      if (update.payload.uuids) {
        const stateBeforeUpdate = lastUndoUpdateHistory.stateBeforeUpdate as Record<
          Uuid,
          PartEntity
        >
        state.entities = mapValues(
          state.entities,
          (currentState: PartEntity, uuid: Uuid) => {
            return uuid in stateBeforeUpdate
              ? stateBeforeUpdate[uuid]
              : currentState
          },
        )
      }
    },
    doRedoPartUpdate: (state: PartsState) => {},
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
    value.rotation = directionToRotation(direction)

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
  (parts, selectedUuids) => pick(parts, selectedUuids),
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
