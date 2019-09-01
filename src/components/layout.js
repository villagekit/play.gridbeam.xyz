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

  html, body, #___gatsby, #___gatsby > div, main {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

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
    <Box
      as='footer'
      p={3}
      fontSize={1}
      fontFamily='body'
      textAlign='center'
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0
      }}
    >
      <Link
        p={1}
        target='_window'
        href='https://github.com/ahdinosaur/play.gridbeam.xyz'
        color='primary'
        sx={{
          textDecoration: 'none',
          ':hover': { textDecoration: 'underline' }
        }}
      >
        play.gridbeam.xyz
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
