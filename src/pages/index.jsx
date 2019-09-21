import React from 'react'
import { Object3D, Vector3 } from 'three'

import { withLayout } from '../components/layout'
import SEO from '../components/seo'
import Playground from '../components/playground'
import Codec from '../codec'
import { rotationByDirection } from '../models/parts'

Object3D.DefaultUp = new Vector3(0, 0, 1)

var defaultParts = [
  {
    type: Codec.PartType.Beam,
    rotation: rotationByDirection.x,
    origin: {
      x: 0,
      y: 1,
      z: 1
    },
    length: 4
  },
  {
    type: Codec.PartType.Beam,
    rotation: rotationByDirection.y,
    origin: {
      x: 1,
      y: 0,
      z: 2
    },
    length: 6
  },
  {
    type: Codec.PartType.Beam,
    rotation: rotationByDirection.z,
    origin: {
      x: 0,
      y: 0,
      z: 0
    },
    length: 10
  }
]

function Page () {
  return (
    <>
      <SEO
        keywords={[
          'grid',
          'beam',
          'modular',
          'open',
          'hardware',
          'construction',
          'furniture'
        ]}
      />
      <Playground defaultParts={defaultParts} />
    </>
  )
}

export default withLayout(Page)
