import { isEqual } from 'lodash'

import Codec from '../codec'

export const directionByAxis = {
  [Codec.AxisDirection.X]: { x: 1, y: 0, z: 0 },
  [Codec.AxisDirection['-X']]: { x: -1, y: 0, z: 0 },
  [Codec.AxisDirection.Y]: { x: 0, y: 1, z: 0 },
  [Codec.AxisDirection['-Y']]: { x: 0, y: -1, z: 0 },
  [Codec.AxisDirection.Z]: { x: 0, y: 0, z: 1 },
  [Codec.AxisDirection['-Z']]: { x: 0, y: 0, z: -1 }
}

const axes = Object.keys(directionByAxis)

export function axisToDirection (axis) {
  return directionByAxis[axis]
}

export function directionToAxis (direction) {
  return axes.find(axis => {
    const axisDirection = directionByAxis[axis]
    return isEqual(direction, axisDirection)
  })
}
