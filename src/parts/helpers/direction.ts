import { forEach, isEqual } from 'lodash'
import { isStandardAxis } from 'src'
import { Vector3 } from 'three'

export interface Direction {
  x: number
  y: number
  z: number
}

export enum AxisDirection {
  X = 0,
  '-X' = 1,
  Y = 2,
  '-Y' = 3,
  Z = 4,
  '-Z' = 5,
}

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

export function isStandardDirection(direction: Direction): boolean {
  return isStandardAxis(directionToVector(direction))
}

function directionToVector(direction: Direction): Vector3 {
  return new Vector3(direction.x, direction.y, direction.z)
}

// for converting from camera.getWorldDirection to the nearest grid
let directionVectorByAxis: Record<AxisDirection, Vector3> = {
  [AxisDirection.X]: new Vector3(1, 0, 0),
  [AxisDirection['-X']]: new Vector3(-1, 0, 0),
  [AxisDirection.Y]: new Vector3(0, 1, 0),
  [AxisDirection['-Y']]: new Vector3(0, -1, 0),
  [AxisDirection.Z]: new Vector3(0, 0, 1),
  [AxisDirection['-Z']]: new Vector3(0, 0, -1),
}
export function directionVectorToNearestAxisDirection(
  directionVector: Vector3,
): Direction {
  let minDistance = Infinity
  let nearestAxis: null | AxisDirection = null
  forEach(directionVectorByAxis, (vector: Vector3, axis: string) => {
    const distance = vector.distanceToSquared(directionVector)
    if (distance < minDistance) {
      minDistance = distance
      nearestAxis = (axis as unknown) as AxisDirection
    }
  })
  if (nearestAxis == null) throw new Error('unexpected')
  return directionByAxis[nearestAxis]
}
