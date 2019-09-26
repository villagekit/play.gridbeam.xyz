import { Vector3 } from 'three'

export const ROTATION = 2 * Math.PI

export function rotateDirection (direction, axis, angle) {
  const { x, y, z } = direction
  var nextVector = new Vector3(x, y, z).applyAxisAngle(axis, angle)
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

function normalizeRotationValue (value) {
  value = roundToPrecision(value)
  if (Object.is(value, -0)) return 0
  return value
}

function roundToPrecision (value, precision = 10) {
  var multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
