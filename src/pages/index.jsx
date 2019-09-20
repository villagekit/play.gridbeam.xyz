import React from 'react'
import { Object3D, Vector3 } from 'three'

import { withLayout } from '../components/layout'
import SEO from '../components/seo'
import Playground from '../components/playground'

Object3D.DefaultUp = new Vector3(0, 0, 1)

var defaultParts = [
  {
    type: 'beam',
    direction: 'x',
    origin: [0, 1, 1],
    length: 4
  },
  {
    type: 'beam',
    direction: 'y',
    origin: [1, 0, 2],
    length: 6
  },
  {
    type: 'beam',
    direction: 'z',
    origin: [0, 0, 0],
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
