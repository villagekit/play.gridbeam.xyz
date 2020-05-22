import { Vector3 } from 'three'

export const X_AXIS = new Vector3(1, 0, 0)
export const Y_AXIS = new Vector3(0, 1, 0)
export const Z_AXIS = new Vector3(0, 0, 1)

export const NEGATIVE_X_AXIS = new Vector3(-1, 0, 0)
export const NEGATIVE_Y_AXIS = new Vector3(0, -1, 0)
export const NEGATIVE_Z_AXIS = new Vector3(0, 0, -1)

export function isStandardAxis(axis: Vector3): boolean {
  if (axis.length() !== 1) return false
  return (
    Math.abs(axis.x) === 1 || Math.abs(axis.y) === 1 || Math.abs(axis.z) === 1
  )
}
