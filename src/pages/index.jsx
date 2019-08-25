import React from 'react'
import { Box, Flex, Text, Link, Image, Button } from 'rebass/styled-components'
import { StaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import shader from 'shader'

import { withLayout } from '../components/layout'
import SEO from '../components/seo'
import Playground from '../components/playground'

var defaultParts = [
  {
    type: 'beam',
    direction: 'x',
    origin: [0, 0, 0],
    length: 2
  },
  {
    type: 'beam',
    direction: 'y',
    origin: [0, 0, 0],
    length: 5
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
