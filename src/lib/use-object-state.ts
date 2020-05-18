// https://github.com/eslachance/react-object-hook

import { clone, get, merge, set } from 'lodash'
import { useState } from 'react'

type PropertyPath = string | Array<string>

export function useObjectState<State extends object>(initialValue: State) {
  const [state, setObj] = useState(initialValue)

  const setStatePath = (path: PropertyPath, value: any) =>
    path ? setObj(clone(set(state, path, value))) : setObj(clone(value))

  const setState = (newState: State) => {
    setObj(clone(merge(state, newState)))
  }

  const getState = (path: PropertyPath) => get(state, path)

  return {
    state,
    setState,
    getState,
    setStatePath,
  }
}

export default useObjectState
