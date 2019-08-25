const create = require('./').default

const [useSettingsStore] = create(set => ({
  shouldRenderHoles: false,
  setShouldRenderHoles: shouldRenderHoles => set(state => {
    state.shouldRenderHoles = shouldRenderHoles
  })
}))

module.exports = useSettingsStore
