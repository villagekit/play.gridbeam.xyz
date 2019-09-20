import { prop, path } from 'ramda'

const INCH_TO_MM = 25.4

export const spec = {
  state: {
    currentSpec: {
      name: 'og-wood-1.5',
      systemOfMeasurement: 'imperial',
      beamMaterial: 'wood',
      beamWidth: 1.5,
      holeDiameter: 5 / 16,
      boltDiameter: 1 / 4
    }
  },
  selectors: (slice, createSelector) => ({
    currentSystemOfMeasurement: () =>
      slice(path(['currentSpec', 'systemOfMeasurement'])),
    currentBeamMaterial: () => slice(path(['currentSpec', 'beamMaterial'])),
    currentBeamWidth: () =>
      createSelector(
        slice(path(['currentSpec', 'systemOfMeasurement'])),
        slice(path(['currentSpec', 'beamWidth'])),
        maybeConvertToMetric
      ),
    currentHoleDiameter: () =>
      createSelector(
        slice(path(['currentSpec', 'systemOfMeasurement'])),
        slice(path(['currentSpec', 'holeDiameter'])),
        maybeConvertToMetric
      ),
    currentBoltDiameter: () =>
      createSelector(
        slice(path(['currentSpec', 'systemOfMeasurement'])),
        slice(path(['currentSpec', 'boltDiameter'])),
        maybeConvertToMetric
      )
  })
}

function maybeConvertToMetric (systemOfMeasurement, value) {
  return systemOfMeasurement === 'imperial' ? value * INCH_TO_MM : value
}
