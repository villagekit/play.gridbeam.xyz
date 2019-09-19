import create from './'

const [useSettingsStore] = create(set => ({
  shouldRenderHoles: false,
  setShouldRenderHoles: shouldRenderHoles =>
    set(state => {
      state.shouldRenderHoles = shouldRenderHoles
    })
}))

export default useSettingsStore
