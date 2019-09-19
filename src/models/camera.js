import produce from 'immer'
import { prop } from 'ramda'

export const camera = {
  name: 'camera',
  state: {
    controlEnabled: true
  },
  reducers: {
    enableControl: produce(state => {
      state.controlEnabled = true
    }),
    disableControl: produce(state => {
      state.controlEnabled = false
    })
  },
  selectors: slice => ({
    isControlEnabled: () => slice(prop('controlEnabled'))
  })
}
