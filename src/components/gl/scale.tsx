// import { union, intersection, sphere, cube } from '@jscad/csg'
// import * as jscad from '@jscad/csg'
import { intersection, union } from '@jscad/csg/src/api/ops-booleans'
import { cube, sphere } from '@jscad/csg/src/api/primitives3d-api'
import React, { useMemo } from 'react'

import CsgGeometry from './csg'

const GOLDEN_RATIO = 1.61803

const totalHeight = 1.7 // 170 cm or ~5' 7''
const headHeight = (1 / 7) * totalHeight
const headWidth = (1 / 8) * totalHeight
const bodyHeight = totalHeight - headHeight
const bodyWidth = (1 / 8) * totalHeight

export default ScaleReference

interface ScaleReferenceProps {}

function ScaleReference(props: ScaleReferenceProps) {
  const csg = useMemo(() => {
    return union(
      intersection(
        sphere({ r: headWidth / GOLDEN_RATIO, center: true }),
        cube({ size: [headWidth, headWidth, headHeight], center: true }),
      ).translate([0, 0, (1 / 2) * headHeight + bodyHeight]),
      cube({
        size: [bodyWidth, bodyWidth, bodyHeight],
        center: true,
      }).translate([0, 0, (1 / 2) * bodyHeight]),
    ).translate([(-1 / 2) * bodyWidth, (-1 / 2) * bodyWidth])
  }, [])

  return (
    <mesh position={[-5e-4, -5e-4, 0]} castShadow receiveShadow>
      <CsgGeometry csg={csg} attach="geometry" />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}
