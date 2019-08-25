import React from 'react'
import PropTypes from 'prop-types'
import { createGlobalStyle } from 'styled-components'
import { Box, Link } from 'rebass/styled-components'
import reset from 'styled-reset'
import shader from 'shader'

import 'typeface-bungee'
import 'typeface-ibm-plex-sans'
import 'typeface-ibm-plex-serif'

const GlobalStyle = createGlobalStyle`
  ${reset}

  * {
    box-sizing: border-box;
  }
`

const Layout = ({ children }) => (
  <Main>
    <GlobalStyle />
    {children}
    <Footer />
  </Main>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

function Main (props) {
  return (
    <Box
      as='main'
      {...props}
      width='100%'
      height='100%'
      css={`
        background-color: ${({ theme }) => shader('#ff', 0.95)};
      `}
    />
  )
}

function Footer () {
  return (
    <Box as='footer' p={3} fontSize={1} fontFamily='body' textAlign='center'>
      <Link
        p={1}
        target='_window'
        href='https://github.com/ahdinosaur/playground.gridbe.am'
        color='primary'
        sx={{
          textDecoration: 'none',
          ':hover': { textDecoration: 'underline' }
        }}
      >
        playground.gridbe.am
      </Link>
      made with
      <span role='img' aria-label='heart' css={{ padding: '0.25rem' }}>
        ❤️
      </span>
      by
      <Link
        p={1}
        href='https://dinosaur.is'
        target='_window'
        color='primary'
        sx={{
          textDecoration: 'none',
          ':hover': { textDecoration: 'underline' }
        }}
      >
        Mikey
      </Link>
    </Box>
  )
}

export default Layout

export function withLayout (PageComponent) {
  return function PageWithLayout (props) {
    return (
      <Layout>
        <PageComponent {...props} />
      </Layout>
    )
  }
}
