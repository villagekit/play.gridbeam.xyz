import create from 'zustand'

const [useCameraStore] = create(set => ({
  controlEnabled: true,
  enableControl: () => set(state => (state.controlEnabled = true)),
  disableControl: () => set(state => (state.controlEnabled = false))
}))

export default useCameraStore
