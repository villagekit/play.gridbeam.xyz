import produce from 'immer'
import { groupBy, pipe, prop } from 'ramda'

const INCH_TO_MM = 25.4

const SPECS = [
  {
    name: 'og',
    systemOfMeasurement: 'imperial',
    sizes: [
      {
        name: '1.5in',
        beamWidth: 1.5,
        commonBeamLengths: [2, 3, 4, 6, 8, i => i * 4]
      }
    ],
    materials: [
      {
        name: 'wood',
        sizes: ['1.5in'],
        holeDiameters: [5 / 16],
        boltDiameters: [1 / 4]
      }
    ]
  }
]

export const spec = {
  state: {
    specs: SPECS,
    currentSpecName: 'og',
    currentSizeName: '1.5in',
    currentMaterialName: 'wood'
  },
  reducers: {
    setCurrentSpecName: produce((state, specName) => {
      state.currentSpecName = specName
    }),
    setCurrentSizeName: produce((state, sizeName) => {
      state.currentSizeName = sizeName
    }),
    setCurrentMaterialName: produce((state, materialName) => {
      state.currentMaterialName = materialName
    })
  },
  selectors: (slice, createSelector) => ({
    currentSpec () {
      return createSelector(
        slice(prop('specs')),
        slice(prop('currentSpecName')),
        (specs, specName) => specs.find(spec => spec.name === specName)
      )
    },
    specsBySystemOfMeasurement () {
      return createSelector(
        slice(prop('specs')),
        groupBy(prop('systemOfMeasurement'))
      )
    },
    currentMaterial () {
      return createSelector(
        this.currentSpec,
        slice(prop('currentMaterialName')),
        (spec, materialName) =>
          spec.materials.find(material => material.name === materialName)
      )
    },
    currentSize () {
      return createSelector(
        this.currentSpec,
        slice(prop('currentSizeName')),
        (spec, sizeName) => spec.sizes.find(size => size.name === sizeName)
      )
    },
    currentSystemOfMeasurement () {
      return createSelector(
        this.currentSpec,
        prop('systemOfMeasurement')
      )
    },
    currentBeamWidth () {
      return createSelector(
        this.currentSystemOfMeasurement,
        pipe(
          this.currentSize,
          prop('beamWidth')
        ),
        maybeConvertToMetric
      )
    },
    currentHoleDiameter () {
      return createSelector(
        this.currentSystemOfMeasurement,
        slice(prop('currentSizeName')),
        this.currentMaterial,
        (systemOfMeasurement, sizeName, material) => {
          const sizeIndex = material.sizes.findIndex(size => size === sizeName)
          const holeDiameter = material.holeDiameters[sizeIndex]
          return maybeConvertToMetric(systemOfMeasurement, holeDiameter)
        }
      )
    },
    currentBoltDiameter () {
      return createSelector(
        this.currentSystemOfMeasurement,
        slice(prop('currentSizeName')),
        this.currentMaterial,
        (systemOfMeasurement, sizeName, material) => {
          const sizeIndex = material.sizes.findIndex(size => size === sizeName)
          const boltDiameter = material.boltDiameters[sizeIndex]
          return maybeConvertToMetric(systemOfMeasurement, boltDiameter)
        }
      )
    }
  })
}

function maybeConvertToMetric (systemOfMeasurement, value) {
  return systemOfMeasurement === 'imperial' ? value * INCH_TO_MM : value
}
