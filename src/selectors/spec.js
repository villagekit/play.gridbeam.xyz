import { prop, path } from 'ramda'
import createSelector from './'

const INCH_TO_MM = 25.4

export const getCurrentSpec = prop('currentSpec')
export const getSystemOfMeasurement = path([
  'currentSpec',
  'systemOfMeasurement'
])

export const getBeamWidth = createSelector(
  [getCurrentSpec, getSystemOfMeasurement],
  (spec, systemOfMeasurement) =>
    systemOfMeasurement === 'imperial'
      ? spec.beamWidth * INCH_TO_MM
      : spec.beamWidth
)

export const getHoleDiameter = createSelector(
  [getCurrentSpec, getSystemOfMeasurement],
  (spec, systemOfMeasurement) =>
    systemOfMeasurement === 'imperial'
      ? spec.holeDiameter * INCH_TO_MM
      : spec.holeDiameter
)
