import { createSelector, createSlice } from '@reduxjs/toolkit'
import { keyBy, mapValues } from 'lodash'
import { RootState } from 'src'
// import { Texture } from 'three'

export enum SystemOfMeasurement {
  imperial = 'imperial',
  metric = 'metric',
}

const INCH_TO_MILLIMETERS = 25.4
const MILLIMETERS_TO_METERS = 1e-3

// id = beam:SystemOfMeasurement:Width:HoleDiameter:Texture
//    = panel:SystemOfMeasurement:Width:Thickness:HoleDiameter:Texture
//
export enum VariantId {
  BeamMetric40mm10mmDouglasFir = 'beam:metric:40mm:10mm:douglas_fir',
  PanelMetric40mm12mm10mmDouglasFir = 'panel:metric:40mm:12mm:10mm:douglas_fir',
}

export interface VariantEntity {
  id: VariantId
  systemOfMeasurement: SystemOfMeasurement
}

export interface BeamVariantEntity extends VariantEntity {
  width: number
  holeDiameter: number
  texturePath: string
}

export interface BeamVariantValue extends BeamVariantEntity {
  normalizedWidth: number
  normalizedHoleDiameter: number
}

export interface PanelVariantEntity extends VariantEntity {
  width: number
  thickness: number
  holeDiameter: number
  texturePath: string
}

export interface PanelVariantValue extends PanelVariantEntity {
  normalizedWidth: number
  normalizedThickness: number
  normalizedHoleDiameter: number
}

export const beamVariants: Array<BeamVariantEntity> = [
  {
    id: VariantId.BeamMetric40mm10mmDouglasFir,
    systemOfMeasurement: SystemOfMeasurement.metric,
    width: 40,
    holeDiameter: 10,
    texturePath: require('../textures/pine.jpg'),
  },
]

// id = SystemOfMeasurement:Width:Thickness:HoleDiameter:Texture
export const panelVariants: Array<PanelVariantEntity> = [
  {
    id: VariantId.PanelMetric40mm12mm10mmDouglasFir,
    systemOfMeasurement: SystemOfMeasurement.metric,
    width: 40,
    thickness: 12,
    holeDiameter: 10,
    texturePath: require('../textures/pine.jpg'),
  },
]

interface VariantsState {
  beams: Array<BeamVariantEntity>
  panels: Array<PanelVariantEntity>
}

interface VariantsValue {
  beams: Array<BeamVariantValue>
  panels: Array<PanelVariantValue>
}

const initialState = {
  beams: beamVariants,
  panels: panelVariants,
}

export const variantsSlice = createSlice({
  name: 'variants',
  initialState,
  reducers: {},
})

// export const {} = variantsSlice.actions

export default variantsSlice.reducer

export const getVariantsState = (state: RootState): VariantsState =>
  state.variants
export const getVariants = createSelector(
  getVariantsState,
  (state): VariantsValue => ({
    beams: state.beams.map((variant: BeamVariantEntity) => ({
      ...variant,
      normalizedWidth: normalizeValueToMeters(
        variant.width,
        variant.systemOfMeasurement,
      ),
      normalizedHoleDiameter: normalizeValueToMeters(
        variant.holeDiameter,
        variant.systemOfMeasurement,
      ),
    })),
    panels: state.panels.map((variant: PanelVariantEntity) => ({
      ...variant,
      normalizedWidth: normalizeValueToMeters(
        variant.width,
        variant.systemOfMeasurement,
      ),
      normalizedThickness: normalizeValueToMeters(
        variant.thickness,
        variant.systemOfMeasurement,
      ),
      normalizedHoleDiameter: normalizeValueToMeters(
        variant.holeDiameter,
        variant.systemOfMeasurement,
      ),
    })),
  }),
)

export const getVariantsById = createSelector(getVariants, (variants) =>
  mapValues(variants, (variantsForType) => keyBy(variantsForType, 'id')),
)

// normalize to meters because Three.js uses meters
// https://github.com/mrdoob/three.js/issues/6259
function normalizeValueToMeters(
  value: number,
  systemOfMeasurement: SystemOfMeasurement,
) {
  return systemOfMeasurement === SystemOfMeasurement.imperial
    ? value * INCH_TO_MILLIMETERS * MILLIMETERS_TO_METERS
    : value * MILLIMETERS_TO_METERS
}
