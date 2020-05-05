import { createSelector, createSlice } from '@reduxjs/toolkit'
import produce from 'immer'
import { groupBy, keyBy } from 'lodash'

import { RootState } from './'

const INCH_TO_MM = 25.4

export enum SpecId {
  og = 0,
}

export enum SizeId {
  // imperial
  '1.5in' = 0,
  '1in' = 1,
  '2in' = 2,

  // metric
  '25mm' = 3,
  '40mm' = 4,
  '50mm' = 5,
}

export enum MaterialId {
  Wood = 0,
  Aluminum = 1,
  Steel = 2,
}

export enum SystemOfMeasurement {
  imperial = 'imperial',
  metric = 'metric',
}

export interface SpecSizeEntity {
  id: SizeId
  label: string
  beamWidth: number
}

export interface SpecMaterialSizeEntity {
  id: SizeId
  holeDiameter: number
  boltDiameter: number
}

export interface SpecMaterialEntity {
  id: MaterialId
  label: string
  sizes: Array<SpecMaterialSizeEntity>
}

export interface SpecEntity {
  id: SpecId
  label: string
  systemOfMeasurement: SystemOfMeasurement
  defaultSizeId: SizeId
  sizes: Array<SpecSizeEntity>
  defaultMaterialId: MaterialId
  materials: Array<SpecMaterialEntity>
}

export interface SpecSizeValue extends SpecSizeEntity {
  normalizedBeamWidth: number
}

export type SpecSizeValues = Record<SizeId, SpecSizeValue>

export interface SpecMaterialSizeValue extends SpecMaterialSizeEntity {
  normalizedHoleDiameter: number
  normalizedBoltDiameter: number
}

export type SpecMaterialSizeValues = Record<SizeId, SpecMaterialSizeValue>

export interface SpecMaterialValue extends Omit<SpecMaterialEntity, 'sizes'> {
  sizes: SpecMaterialSizeValues
}

export type SpecMaterialValues = Record<MaterialId, SpecMaterialValue>

export interface SpecValue extends Omit<SpecEntity, 'sizes' | 'materials'> {
  sizes: Array<SpecSizeValue>
  materials: Array<SpecMaterialValue>
}

const SPECS: Array<SpecEntity> = [
  {
    id: SpecId.og,
    label: 'og',
    systemOfMeasurement: SystemOfMeasurement.imperial,
    defaultSizeId: SizeId['1.5in'],
    sizes: [
      {
        id: SizeId['1.5in'],
        label: '1.5 inch',
        beamWidth: 1.5,
        // commonBeamLengths: [2, 3, 4, 6, 8, i => i * 4]
      },
    ],
    defaultMaterialId: MaterialId.Wood,
    materials: [
      {
        id: MaterialId.Wood,
        label: 'wood',
        sizes: [
          {
            id: SizeId['1.5in'],
            holeDiameter: 5 / 16,
            boltDiameter: 1 / 4,
          },
        ],
      },
    ],
  },
]

export interface SpecState {
  specs: Array<SpecEntity>
  currentSpecId: SpecId | null
  currentSizeId: SizeId | null
  currentMaterialId: MaterialId | null
}

const initialState: SpecState = {
  specs: SPECS,
  currentSpecId: null,
  currentSizeId: null,
  currentMaterialId: null,
}

export const specSlice = createSlice({
  name: 'spec',
  initialState,
  reducers: {
    doSetCurrentSpecId: (state, action) => {
      const specId = action.payload
      state.currentSpecId = specId
      const spec = state.specs.find((spec) => spec.id === specId)
      if (spec == null) throw new Error(`unknown spec id: ${specId}`)
      state.currentSizeId = spec.defaultSizeId
      state.currentMaterialId = spec.defaultMaterialId
    },
    doSetCurrentSizeId: (state, action) => {
      const sizeId = action.payload
      state.currentSizeId = sizeId
    },
    doSetCurrentMaterialId: (state, action) => {
      const materialId = action.payload
      state.currentMaterialId = materialId
    },
  },
})

export const {
  doSetCurrentSpecId,
  doSetCurrentSizeId,
  doSetCurrentMaterialId,
} = specSlice.actions

export default specSlice.reducer

export const getSpecState = (state: RootState): SpecState => state.spec
export const getSpecs = createSelector(getSpecState, (state) => state.specs)
export const getCurrentSpecId = createSelector(
  getSpecState,
  (state) => state.currentSpecId,
)
export const getCurrentSizeId = createSelector(
  getSpecState,
  (state) => state.currentSizeId,
)
export const getCurrentMaterialId = createSelector(
  getSpecState,
  (state) => state.currentMaterialId,
)
export const getCurrentSpec = createSelector(
  getSpecs,
  getCurrentSpecId,
  (specs, currentSpecId): SpecEntity => {
    const spec = specs.find((spec) => spec.id === currentSpecId)
    if (spec == null) throw new Error(`unknown spec id: ${currentSpecId}`)
    return spec
  },
)
export const getCurrentSystemOfMeasurement = createSelector(
  getCurrentSpec,
  (spec) => spec.systemOfMeasurement,
)
export const getSpecsBySystemOfMeasurement = createSelector(
  getSpecs,
  (specs) => {
    return groupBy(specs, 'systemOfMeasurement')
  },
)
export const getCurrentSpecSizes = createSelector(
  getCurrentSpec,
  (spec: SpecEntity): SpecSizeValues => {
    const sizes = spec.sizes.map(
      produce((size) => {
        size.normalizedBeamWidth = normalizeValueToMetric(
          size.beamWidth,
          spec.systemOfMeasurement,
        )
      }),
    )
    return keyBy(sizes, 'id') as SpecSizeValues
  },
)
export const getCurrentSpecMaterials = createSelector(
  getCurrentSpec,
  (spec): SpecMaterialValues => {
    const materials: Array<SpecMaterialValue> = spec.materials.map(
      (material: SpecMaterialEntity): SpecMaterialValue => {
        const sizes: Array<SpecMaterialSizeValue> = material.sizes.map(
          (materialSize: SpecMaterialSizeEntity): SpecMaterialSizeValue => {
            const normalizedHoleDiameter = normalizeValueToMetric(
              materialSize.holeDiameter,
              spec.systemOfMeasurement,
            )
            const normalizedBoltDiameter = normalizeValueToMetric(
              materialSize.boltDiameter,
              spec.systemOfMeasurement,
            )
            return Object.assign({}, materialSize, {
              normalizedHoleDiameter,
              normalizedBoltDiameter,
            })
          },
        )
        const sizesById = keyBy(sizes, 'id') as SpecMaterialSizeValues
        return Object.assign({}, material, { sizes: sizesById })
      },
    )
    return keyBy(materials, 'id') as SpecMaterialValues
  },
)
export const getCurrentSpecSize = createSelector(
  getCurrentSizeId,
  getCurrentSpecSizes,
  (currentSizeId, currentSpecSizes) => {
    if (currentSizeId == null) return null
    return currentSpecSizes[currentSizeId]
  },
)
export const getCurrentSpecMaterial = createSelector(
  getCurrentMaterialId,
  getCurrentSpecSizes,
  (currentMaterialId, currentSpecMaterials) => {
    if (currentMaterialId == null) return null
    return currentSpecMaterials[currentMaterialId]
  },
)

function normalizeValueToMetric(
  value: number,
  systemOfMeasurement: SystemOfMeasurement,
) {
  return systemOfMeasurement === SystemOfMeasurement.imperial
    ? value * INCH_TO_MM
    : value
}
