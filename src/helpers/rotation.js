import { Spherical, Vector3 } from 'three'

export const ROTATION = Math.PI * 2

export function rotateDirection (direction, axis, angle) {
  // THREE's spherical coordinates are such that:
  //
  // azimuth = phi = angle from the y axis
  // inclination = theta = angle around the y axis
  //
  const { inclination, azimuth } = direction
  const nextCartesian = new Vector3()
    .setFromSphericalCoords(1, azimuth, inclination)
    .applyAxisAngle(axis, angle)
  const nextSpherical = new Spherical().setFromCartesianCoords(
    nextCartesian.x,
    nextCartesian.y,
    nextCartesian.z
  )
  console.log('cartesian', direction, nextCartesian, nextSpherical)
  return {
    inclination: nextSpherical.theta,
    azimuth: nextSpherical.phi
  }
}
