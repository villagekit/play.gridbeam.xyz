import { createSelector, createSlice } from '@reduxjs/toolkit'
import produce from 'immer'
import { groupBy, keyBy, property } from 'lodash'

import Codec from '../codec'

const INCH_TO_MM = 25.4

const SPECS = [
  {
    id: Codec.SpecId.og,
    label: 'og',
    systemOfMeasurement: 'imperial',
    defaultSizeId: Codec.SizeId['1.5in'],
    sizes: [
      {
        id: Codec.SizeId['1.5in'],
        label: '1.5 inch',
        beamWidth: 1.5,
        // commonBeamLengths: [2, 3, 4, 6, 8, i => i * 4]
      },
    ],
    defaultMaterialId: Codec.MaterialId.Wood,
    materials: [
      {
        id: Codec.MaterialId.Wood,
        label: 'wood',
        sizes: [
          {
            id: Codec.SizeId['1.5in'],
            holeDiameter: 5 / 16,
            boltDiameter: 1 / 4,
          },
        ],
      },
    ],
  },
]

export const specSlice = createSlice({
  name: 'spec',
  initialState: {
    specs: SPECS,
    currentSpecId: null,
    currentSizeId: null,
    currentMaterialId: null,
  },
  reducers: {
    doSetCurrentSpecId: (state, action) => {
      const specId = action.payload
      state.currentSpecId = specId
      const spec = state.specs.find((spec) => spec.id === specId)
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

export const getSpecState = property('spec')
export const getSpecs = createSelector(getSpecState, property('specs'))
export const getCurrentSpecId = createSelector(
  getSpecState,
  property('currentSpecId'),
)
export const getCurrentSizeId = createSelector(
  getSpecState,
  property('currentSizeId'),
)
export const getCurrentMaterialId = createSelector(
  getSpecState,
  property('currentMaterialId'),
)
export const getCurrentSpec = createSelector(
  getSpecs,
  getCurrentSpecId,
  (specs, currentSpecId) => {
    return specs.find((spec) => spec.id === currentSpecId)
  },
)
export const getCurrentSystemOfMeasurement = createSelector(
  getCurrentSpec,
  property('systemOfMeasurement'),
)
export const getSpecsBySystemOfMeasurement = createSelector(
  getSpecs,
  (specs) => {
    return groupBy(specs, 'systemOfMeasurement')
  },
)
export const getCurrentSpecSizes = createSelector(getCurrentSpec, (spec) => {
  const sizes = spec.sizes.map(
    produce((size) => {
      size.normalizedBeamWidth = normalizeValueToMetric(
        size.beamWidth,
        spec.systemOfMeasurement,
      )
    }),
  )
  return keyBy(sizes, 'id')
})
export const getCurrentSpecMaterials = createSelector(
  getCurrentSpec,
  (spec) => {
    const materials = spec.materials.map(
      produce((material) => {
        const sizes = material.sizes.map(
          produce((materialSize) => {
            materialSize.normalizedHoleDiameter = normalizeValueToMetric(
              materialSize.holeDiameter,
              spec.systemOfMeasurement,
            )
            materialSize.normalizedBoltDiameter = normalizeValueToMetric(
              materialSize.boltDiameter,
              spec.systemOfMeasurement,
            )
          }),
        )
        material.sizes = keyBy(sizes, 'id')
      }),
    )
    return keyBy(materials, 'id')
  },
)
export const getCurrentSpecSize = createSelector(
  getCurrentSizeId,
  getCurrentSpecSizes,
  (currentSizeId, currentSpecSizes) => currentSpecSizes[currentSizeId],
)
export const getCurrentSpecMaterial = createSelector(
  getCurrentMaterialId,
  getCurrentSpecSizes,
  (currentMaterialId, currentSpecMaterials) =>
    currentSpecMaterials[currentMaterialId],
)

function normalizeValueToMetric(value, systemOfMeasurement) {
  return systemOfMeasurement === 'imperial' ? value * INCH_TO_MM : value
}
