import {
  ActionReducerMapBuilder,
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { capitalize, groupBy, isEmpty, keys, values, zipObject } from 'lodash'
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

export interface PartValue extends PartEntity {
  uuid: Uuid
  isHovered: boolean
  isSelected: boolean
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
type HappenStateValue = Record<Uuid, boolean>
type HappenState = Record<HappenStateKey, HappenStateValue>

export type PartsState = {
  entities: null | Record<Uuid, PartEntity>
  isMoving: boolean
  previousStates: Array<PartsState>
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
  isMoving: false,
  hoveredUuids: hoverHappening.initialState,
  selectedUuids: selectHappening.initialState,
  previousStates: [],
}

export const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    doSetAnyPartIsMoving: (state, action) => {
      state.isMoving = action.payload
    },
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
      const updater = action.payload
      const safeUpdater = SafeUpdater(createUpdater<PartEntity>(updater))
      const { selectedUuids } = state
      keys(selectedUuids).forEach((uuid) => {
        if (state.entities !== null) {
          if (state.entities[uuid] === null)
            throw new Error(`cannot update a part that doesn't exist: ${uuid}`)
          safeUpdater(state.entities[uuid])
        }
      })
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
    doAddPreviousState: (state) => {},
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
  doSetAnyPartIsMoving,
  doSetParts,
  doAddPart,
  doAddParts,
  doUpdatePart,
  doUpdateSelectedParts,
  doRemoveSelectedParts,
} = partsSlice.actions

export default partsSlice.reducer

export const getPartsState = (state: RootState): PartsState => state.parts
export const getAnyPartIsMoving = createSelector(
  getPartsState,
  (state) => state.isMoving,
)
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
  getCurrentSpecSizes,
  getCurrentSpecMaterials,
  (
    part,
    hoveredUuids,
    selectedUuids,
    currentSpecSizes,
    currentSpecMaterials,
    uuid,
  ): PartValue => {
    const isHovered = Boolean(uuid in hoveredUuids)
    const isSelected = Boolean(uuid in selectedUuids)

    const { sizeId, materialId } = part
    const specSize = currentSpecSizes[sizeId]
    const specMaterial = currentSpecMaterials[materialId]
    const specMaterialSize = specMaterial.sizes[sizeId]
    const beamWidth = specSize.normalizedBeamWidth
    const holeDiameter = specMaterialSize.normalizedHoleDiameter
    const boltDiameter = specMaterialSize.normalizedBoltDiameter

    const { origin, direction } = part
    const position: [number, number, number] = [
      (1 / 2 + origin.x) * beamWidth,
      (1 / 2 + origin.y) * beamWidth,
      (1 / 2 + origin.z) * beamWidth,
    ]
    const rotation = directionToRotation(direction)

    return Object.assign({}, part, {
      uuid,
      isHovered,
      isSelected,
      specSize,
      specMaterial,
      specMaterialSize,
      beamWidth,
      holeDiameter,
      boltDiameter,
      position,
      rotation,
    })
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
