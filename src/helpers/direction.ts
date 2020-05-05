import { isEqual } from 'lodash'

import { AxisDirection, Direction } from '../store'

export const directionByAxis: Record<AxisDirection, Direction> = {
  [AxisDirection.X]: { x: 1, y: 0, z: 0 },
  [AxisDirection['-X']]: { x: -1, y: 0, z: 0 },
  [AxisDirection.Y]: { x: 0, y: 1, z: 0 },
  [AxisDirection['-Y']]: { x: 0, y: -1, z: 0 },
  [AxisDirection.Z]: { x: 0, y: 0, z: 1 },
  [AxisDirection['-Z']]: { x: 0, y: 0, z: -1 },
}

const axes: Array<AxisDirection> = Object.keys(directionByAxis).map(Number)

export function axisToDirection(axis: AxisDirection) {
  return directionByAxis[axis]
}

export function directionToAxis(direction: Direction) {
  return axes.find((axis) => {
    const axisDirection = directionByAxis[axis]
    return isEqual(direction, axisDirection)
  })
}
