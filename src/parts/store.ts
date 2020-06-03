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
  flattenDeep,
  forEach,
  get,
  groupBy,
  isArray,
  isEmpty,
  keys,
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

import { Direction } from './helpers/direction'
import createUpdater, { UpdateDescriptor } from './helpers/updater'

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

export enum PartTransitionType {
  move = 'move',
  length = 'length',
  rotate = 'rotate',
}
// TODO should transition contain uuids affected, or assume selected uuids?
interface PartTransition {
  type: PartTransitionType
  update: UpdateDescriptor
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
type HappenStateValue = Record<Uuid, true>
type HappenState = Record<HappenStateKey, HappenStateValue>

interface Undo {
  transition: PartTransition
  reverseUpdate: Record<Uuid, UpdateDescriptor>
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
  undos: Array<Undo>
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
  undos: [],
  hoveredUuids: hoverHappening.initialState,
  selectedUuids: selectHappening.initialState,
}

function helpUpdateSelectedParts({
  entities,
  selectedUuids,
  update,
}: {
  entities: Record<Uuid, PartEntity>
  selectedUuids: Record<Uuid, true>
  update: UpdateDescriptor
}) {
  const updater = createUpdater<PartEntity>(update)
  const safeUpdater = SafeUpdater(updater)
  keys(selectedUuids).forEach((uuid) => {
    if (entities !== null) {
      if (entities[uuid] === null) {
        throw new Error(`cannot update a part that doesn't exist: ${uuid}`)
      }
      safeUpdater(entities[uuid])
    }
  })
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
      state.entities = zipObject(uuids, parts)
    },
    doAddPart: (state: PartsState, action: PayloadAction<PartEntity>) => {
      if (state.entities === null) state.entities = {}
      const uuid: Uuid = MathUtils.generateUUID()
      state.entities[uuid] = action.payload
    },
    doAddParts: (
      state: PartsState,
      action: PayloadAction<Array<PartEntity>>,
    ) => {
      if (state.entities === null) state.entities = {}
      const newParts = action.payload
      newParts.forEach((newPart) => {
        const uuid: Uuid = MathUtils.generateUUID()
        if (state.entities !== null) state.entities[uuid] = newPart
      })
    },
    doUpdatePart: (
      state: PartsState,
      action: PayloadAction<{ uuid: Uuid; updater: UpdateDescriptor }>,
    ) => {
      if (state.entities === null) state.entities = {}
      const { uuid, updater } = action.payload
      const safeUpdater = SafeUpdater(createUpdater<PartEntity>(updater))
      safeUpdater(state.entities[uuid])
    },
    doUpdateSelectedParts: (
      state: PartsState,
      action: PayloadAction<UpdateDescriptor>,
    ) => {
      if (state.entities === null) state.entities = {}
      const { entities, selectedUuids } = state
      const update = action.payload
      helpUpdateSelectedParts({ entities, selectedUuids, update })
    },
    doRemoveSelectedParts: (state) => {
      if (state.entities === null) state.entities = {}
      const { selectedUuids } = state
      keys(selectedUuids).forEach((uuid) => {
        if (state.entities !== null) {
          delete state.entities[uuid]
        }
      })
    },
    doStartPartTransition: (
      state: PartsState,
      action: PayloadAction<PartTransitionType>,
    ) => {
      state.currentTransition = {
        type: action.payload,
        update: null,
      }
    },
    doUpdatePartTransition: (
      state: PartsState,
      action: PayloadAction<UpdateDescriptor>,
    ) => {
      if (state.currentTransition == null)
        throw new Error('cannot update transition without start')
      state.currentTransition.update = action.payload
    },
    doEndPartTransition: (state: PartsState) => {
      if (state.currentTransition == null)
        throw new Error('cannot end transition without start')
      if (state.entities === null) state.entities = {}
      const { entities, selectedUuids, currentTransition } = state
      const { update } = currentTransition

      // generate undo using un-updated state
      let reverseUpdate: Undo['reverseUpdate'] = {}
      let undo: Undo = {
        transition: currentTransition,
        reverseUpdate,
      }
      const updates = isArray(update) ? flattenDeep(update) : [update]
      forEach(keys(selectedUuids), (uuid: Uuid) => {
        forEach(updates, (update: UpdateDescriptor) => {
          if (update == null || isArray(update)) return
          const { path } = update
          const entity = entities[uuid]
          const previousValueAtPath = get(entity, path)
          if (reverseUpdate[uuid] == null) {
            reverseUpdate[uuid] = [] as Array<UpdateDescriptor>
          }
          // @ts-ignore
          reverseUpdate[uuid].push({
            update: 'set',
            path,
            value: previousValueAtPath,
          })
        })
      })

      // apply transition update
      helpUpdateSelectedParts({ entities, selectedUuids, update })

      state.currentTransition = null
      state.undos.push(undo)
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
  doAddPart,
  doAddParts,
  doUpdatePart,
  doUpdateSelectedParts,
  doRemoveSelectedParts,
  doStartPartTransition,
  doUpdatePartTransition,
  doEndPartTransition,
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
/*
function helpGetSelectedPartsEntities(
  entities: PartsState['entities'],
  selectedUuids: PartsState['selectedUuids'],
) {
  return pick(entities, keys(selectedUuids)) as Record<Uuid, PartEntity>
}
export const getSelectedPartsEntities = createSelector(
  getPartsEntities,
  getSelectedUuids,
  helpGetSelectedPartsEntities,
)
*/
export const getCurrentPartTransition = createSelector(
  getPartsState,
  (state) => state.currentTransition,
)
export const getPartUndos = createSelector(
  getPartsState,
  (state) => state.undos,
)
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
    const isHovered = Boolean(uuid in hoveredUuids)
    const isSelected = Boolean(uuid in selectedUuids)
    const isTransitioning = isSelected

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
      isTransitioning,
      transition: null,
      stateBeforeTransition: null,
      specSize,
      specMaterial,
      specMaterialSize,
      beamWidth,
      holeDiameter,
      boltDiameter,
    })

    if (currentTransition && isTransitioning) {
      value.transition = currentTransition
      value.stateBeforeTransition = part
      const { update } = currentTransition
      const updater = createUpdater<PartEntity>(update)
      const safeUpdater = SafeUpdater(updater)
      const nextPart = produce<PartEntity>(part, safeUpdater)
      Object.assign(value, nextPart)
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

  const initialState: HappenStateValue = {}

  const actions = { doHappenAction, doUnhappenAction, doHappensAction }

  const buildReducers = (builder: ActionReducerMapBuilder<PartsState>) => {
    builder.addCase(
      doHappenAction,
      (state: PartsState, action: PayloadAction<Uuid>) => {
        const uuid: Uuid = action.payload
        const happenState: HappenStateValue = state[stateKey]
        happenState[uuid] = true
      },
    )

    builder.addCase(
      doUnhappenAction,
      (state: PartsState, action: PayloadAction<Uuid>) => {
        const uuid = action.payload
        delete state[stateKey][uuid]
      },
    )

    builder.addCase(
      doHappensAction,
      (state: PartsState, action: PayloadAction<Array<Uuid>>) => {
        const uuids = action.payload
        const happenedUuidsObject: HappenStateValue = state[stateKey]
        const happenedUuids: Array<Uuid> = keys(happenedUuidsObject)
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
      },
    )
  }

  return {
    initialState,
    actions,
    buildReducers,
  }
}

export type PartUpdater = (part: PartEntity) => void

function SafeUpdater(updater: PartUpdater) {
  return (value: PartEntity) => {
    updater(value)
    if (value.length < 1) value.length = 1
    if (value.origin.z < 0) value.origin.z = 0
  }
}
