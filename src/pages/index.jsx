import React from 'react'
import { Box, Flex, Text, Link, Image, Button } from 'rebass/styled-components'
import { StaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import shader from 'shader'

import { withLayout } from '../components/layout'
import SEO from '../components/seo'

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
      <Playground />
    </>
  )
}

export default withLayout(Page)

function Playground (props) {
  return 'playground'
}
