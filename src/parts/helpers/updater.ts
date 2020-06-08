// declarative updates

import { clamp, flow, identity, isArray, update } from 'lodash'
import { Direction } from 'src'

import { rotateDirection } from './rotation'

export interface BaseDescriptor {
  update: string
  path: string | Array<string>
}

export interface SetDescriptor extends BaseDescriptor {
  update: 'set'
  value: number
}
export interface AddDescriptor extends BaseDescriptor {
  update: 'add'
  value: number
}
export interface SubDescriptor extends BaseDescriptor {
  update: 'sub'
  value: number
}
export interface ClampDescriptor extends BaseDescriptor {
  update: 'clamp'
  min: number
  max: number
}
export interface RotateDescriptor extends BaseDescriptor {
  update: 'rotate'
  axis: any
  angle: any
}
export type UpdateDescriptorAtom =
  | SetDescriptor
  | AddDescriptor
  | SubDescriptor
  | ClampDescriptor
  | RotateDescriptor
export type UpdateDescriptor =
  | null
  | UpdateDescriptorAtom
  | Array<UpdateDescriptorAtom>
export type Updater<T extends object = object> = (obj: T) => T

export default function createUpdater<T extends object = object>(
  updateDescriptor: UpdateDescriptor,
): Updater<T> {
  if (updateDescriptor == null) {
    return identity
  }

  if (isArray(updateDescriptor)) {
    return flow(updateDescriptor.map(createUpdater))
  }

  let pathUpdater: (value: any) => any
  switch (updateDescriptor.update) {
    case 'set':
      pathUpdater = setUpdater(updateDescriptor)
      break
    case 'add':
      pathUpdater = addUpdater(updateDescriptor)
      break
    case 'sub':
      pathUpdater = subUpdater(updateDescriptor)
      break
    case 'clamp':
      pathUpdater = clampUpdater(updateDescriptor)
      break
    case 'rotate':
      pathUpdater = rotateUpdater(updateDescriptor)
      break
  }

  return function performUpdate(obj: T): T {
    return update(obj, updateDescriptor.path, pathUpdater)
  }
}

const setUpdater = ({ value }: SetDescriptor) => () => value
const addUpdater = ({ value: valueToAdd }: AddDescriptor) => (value: number) =>
  value + valueToAdd
const subUpdater = ({ value: valueToSub }: SubDescriptor) => (value: number) =>
  value - valueToSub
const clampUpdater = ({ max = -Infinity, min = Infinity }: ClampDescriptor) => (
  value: number,
) => clamp(value, min, max)
const rotateUpdater = ({ axis, angle }: RotateDescriptor) => (
  value: Direction,
) => rotateDirection(value, axis, angle)
