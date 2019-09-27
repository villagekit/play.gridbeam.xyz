import React from 'react'
import { Object3D, Vector3 } from 'three'

import { withLayout } from '../components/layout'
import Head from '../components/head'
import Playground from '../components/playground'
import Codec from '../codec'
import { directionByAxis } from '../helpers/direction'

Object3D.DefaultUp = new Vector3(0, 0, 1)

var defaultModel = {
  specId: Codec.SpecId.og,
  parts: [
    {
      type: Codec.PartType.Beam,
      sizeId: Codec.SizeId['1.5in'],
      materialId: Codec.MaterialId.Wood,
      origin: {
        x: 0,
        y: 1,
        z: 1
      },
      direction: directionByAxis[Codec.AxisDirection.X],
      length: 4
    },
    {
      type: Codec.PartType.Beam,
      sizeId: Codec.SizeId['1.5in'],
      materialId: Codec.MaterialId.Wood,
      origin: {
        x: 1,
        y: 0,
        z: 2
      },
      direction: directionByAxis[Codec.AxisDirection.Y],
      length: 6
    },
    {
      type: Codec.PartType.Beam,
      sizeId: Codec.SizeId['1.5in'],
      materialId: Codec.MaterialId.Wood,
      origin: {
        x: 0,
        y: 0,
        z: 0
      },
      direction: directionByAxis[Codec.AxisDirection.Z],
      length: 10
    }
  ]
}

function Page () {
  return (
    <>
      <Head
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
      <Playground defaultModel={defaultModel} />
    </>
  )
}

export default withLayout(Page)
