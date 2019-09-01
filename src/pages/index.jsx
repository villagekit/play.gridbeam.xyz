import React from 'react'
import { Object3D, Vector3 } from 'three'
import { Box, Flex, Text, Link, Image, Button } from 'rebass/styled-components'
import { StaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import shader from 'shader'

import { withLayout } from '../components/layout'
import SEO from '../components/seo'
import Playground from '../components/playground'

Object3D.DefaultUp = new Vector3(0, 0, 1)

/*

http://localhost:8000/#N4IgbgpgTgzglgewHYgFwgIwgDQgA4CGUALjGgNqjECeeEaIARhAQLY4gAmcUEAxsUQp0ADw4IocAOZxh5AAzYMSgLq4ANhCRTiACzQAWAL7YqteumZsO3XgKEMxuCdNkVFyg2pCbtewyZmdAxW7Li2-ILIDNTikjJyyory3r46+qgArIEgNMGWLGFcPJEO6ABeca5yydgpGlrpaBjyRipGQA

*/

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
