import produce from 'immer'
import { groupBy, indexBy, map, pipe, prop } from 'ramda'

import Codec from '../codec'

const INCH_TO_MM = 25.4

const SPECS = [
  {
    id: Codec.SpecId.og,
    label: 'og',
    systemOfMeasurement: 'imperial',
    sizes: [
      {
        id: Codec.SizeId['1.5in'],
        label: '1.5 inch',
        beamWidth: 1.5,
        commonBeamLengths: [2, 3, 4, 6, 8, i => i * 4]
      }
    ],
    materials: [
      {
        id: Codec.MaterialId.wood,
        label: 'wood',
        sizes: [
          {
            id: Codec.SizeId['1.5in'],
            holeDiameter: 5 / 16,
            boltDiameter: 1 / 4
          }
        ]
      }
    ]
  }
]

export const spec = {
  state: {
    specs: SPECS,
    currentSpecId: Codec.SpecId.og,
    currentSizeId: Codec.SizeId['1.5in'],
    currentMaterialId: Codec.MaterialId.wood
  },
  reducers: {
    setCurrentSpecId: produce((state, specId) => {
      state.currentSpecId = specId
    }),
    setCurrentSizeId: produce((state, sizeId) => {
      state.currentSizeId = sizeId
    }),
    setCurrentMaterialId: produce((state, materialId) => {
      state.currentMaterialId = materialId
    })
  },
  selectors: (slice, createSelector) => ({
    currentSpecId: () => slice(prop('currentSpecId')),
    currentSizeId: () => slice(prop('currentSizeId')),
    currentMaterialId: () => slice(prop('currentMaterialId')),

    currentSpec () {
      return createSelector(
        slice(prop('specs')),
        slice(prop('currentSpecId')),
        (specs, specId) => specs.find(spec => spec.id === specId)
      )
    },
    specsBySystemOfMeasurement () {
      return createSelector(
        slice(prop('specs')),
        groupBy(prop('systemOfMeasurement'))
      )
    },
    currentSpecSizes () {
      return createSelector(
        this.currentSpec,
        spec =>
          pipe(
            map(
              produce(size => {
                size.normalizedBeamWidth = normalizeValueToMetric(
                  size.beamWidth,
                  spec.systemOfMeasurement
                )
              })
            ),
            indexBy(prop('id'))
          )(spec.sizes)
      )
    },
    currentSpecMaterials () {
      return createSelector(
        this.currentSpec,
        spec =>
          pipe(
            map(
              produce(material => {
                material.sizes = pipe(
                  map(
                    produce(materialSize => {
                      materialSize.normalizedHoleDiameter = normalizeValueToMetric(
                        materialSize.holeDiameter,
                        spec.systemOfMeasurement
                      )
                      materialSize.normalizedBoltDiameter = normalizeValueToMetric(
                        materialSize.boltDiameter,
                        spec.systemOfMeasurement
                      )
                    })
                  ),
                  indexBy(prop('id'))
                )(material.sizes)
              })
            ),
            indexBy(prop('id'))
          )(spec.materials)
      )
    },
    currentSize () {
      return createSelector(
        slice(prop('currentSizeId')),
        this.currentSpecSizes,
        prop
      )
    },
    currentMaterial () {
      return createSelector(
        slice(prop('currentMaterialId')),
        this.currentSpecMaterials,
        prop
      )
    },
    currentSystemOfMeasurement () {
      return createSelector(
        this.currentSpec,
        prop('systemOfMeasurement')
      )
    }
  })
}

function normalizeValueToMetric (value, systemOfMeasurement) {
  return systemOfMeasurement === 'imperial' ? value * INCH_TO_MM : value
}
