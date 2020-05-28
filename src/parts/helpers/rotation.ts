import { isEqual } from 'lodash'
import { Direction } from 'src'
import { Euler, Vector3 } from 'three'

type Axis = Vector3

export const ROTATION = 2 * Math.PI

// TODO: figure out the proper solution to this.
// i just did a radical guess, and it checked.
export function directionToRotation(direction: Direction): Euler {
  const { x, y, z } = direction
  const radius = Math.sqrt(x * x + y * y + z * z)
  const theta = -Math.atan2(z, y)
  const phi = Math.acos(x / radius)
  return new Euler(0, theta, phi, 'ZYX')
}

export function rotateDirection(
  direction: Direction,
  axis: Axis,
  angle: number,
) {
  const { x, y, z } = direction
  const nextVector = new Vector3(x, y, z).applyAxisAngle(axis, angle)
  // normalize values
  nextVector.x = normalizeRotationValue(nextVector.x)
  nextVector.y = normalizeRotationValue(nextVector.y)
  nextVector.z = normalizeRotationValue(nextVector.z)
  return { x: nextVector.x, y: nextVector.y, z: nextVector.z }
}

/*
export function rotateX (vector, angle) {
  var rotation = new Matrix()
  rotation.set(
    1,
    0,
    0,
    0,
    Math.cos(angle),
    -Math.sin(angle),
    0,
    Math.sin(angle),
    Math.cos(angle)
  )
  return vector.applyMatrix3(rotation)
}
*/

function normalizeRotationValue(value: number) {
  value = roundToPrecision(value)
  if (isEqual(value, -0)) return 0
  return value
}

function roundToPrecision(value: number, precision = 10) {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
