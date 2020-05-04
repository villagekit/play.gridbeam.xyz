// declarative updates

import { clamp, isArray, flow, update } from 'lodash'

import { rotateDirection } from './rotation'

export default function createUpdater(updateDescriptor) {
  if (isArray(updateDescriptor)) {
    return flow(updateDescriptor.map(createUpdater))
  }

  const { update: updaterType, path } = updateDescriptor

  const createPathUpdater = updaters[updaterType]

  if (createPathUpdater == null) {
    throw new Error(`unexpected update type: ${updaterType}`)
  }

  const pathUpdater = createPathUpdater(updateDescriptor)
  return function performUpdate(object) {
    return update(object, path, pathUpdater)
  }
}

const updaters = {
  set: ({ value }) => () => value,
  add: ({ value: valueToAdd }) => (value) => value + valueToAdd,
  sub: ({ value: valueToSub }) => (value) => value - valueToSub,
  clamp: ({ max = -Math.Infinity, min = Math.Infinity }) => (value) =>
    clamp(value, min, max),
  rotate: ({ axis, angle }) => (value) => rotateDirection(value, axis, angle),
}
