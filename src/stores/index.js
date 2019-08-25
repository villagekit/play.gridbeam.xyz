import produce from 'immer'
import create from 'zustand'

export default base

//  new store
//  - single zustand store
//  - many "dino" stores
//
//  - name
//  - actions: {
//      action: (set) => (...args) => set(state => {
//        state.key = value
//      })
//    }
//  - selectors: {
//      select: [
//        name,
//        (...values) => selection
//      ]
//  - effects: {
//      react: [
//        name,
//        (...values) => action(...args) | null
//      ]
//    }

function base (config) {
  return create(log(immer(nextConfig)))

  function nextConfig (set, get, api) {
    return config(set, get, api)
  }
}

function log (config) {
  return function (set, get, api) {
    return config(nextSet, get, api)

    function nextSet (args) {
      // console.log('  applying', args)
      set(args)
      console.log('  new state', get())
    }
  }
}

function immer (config) {
  return function (set, get, api) {
    return config(nextSet, get, api)

    function nextSet (fn) {
      set(produce(fn))
    }
  }
}
