const create = require('./').default

const [useSpecStore] = create(set => ({
  currentSpec: {
    name: 'og-wood-1.5',
    systemOfMeasurement: 'imperial',
    beamWidth: 1.5,
    beamMaterial: 'wood',
    holeDiameter: 5 / 16,
    boltDiameter: 1 / 4
  }
}))

module.exports = useSpecStore
