import React from 'react'
import PropTypes from 'prop-types'
import { Global as GlobalStyle, css } from '@emotion/core'
import { Box, Link } from 'theme-ui'
import reset from 'emotion-reset'
import { shade } from '@theme-ui/color'

import 'typeface-bungee'
import 'typeface-ibm-plex-sans'
import 'typeface-ibm-plex-serif'

const Layout = ({ children }) => (
  <Main>
    <GlobalStyle
      styles={css`
        ${reset}

        html, body, #___gatsby, #___gatsby > div, main {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }

        *,
        *::after,
        *::before {
          box-sizing: border-box;
          -moz-osx-font-smoothing: grayscale;
          -webkit-font-smoothing: antialiased;
          font-smoothing: antialiased;
        }
      `}
    />
    {children}
    <Footer />
  </Main>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

function Main(props) {
  return (
    <Box
      as="main"
      {...props}
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: shade('white', 0.95),
      }}
    />
  )
}

function Footer() {
  return (
    <Box
      as="footer"
      sx={{
        padding: 1,
        fontSize: 1,
        fontFamily: 'body',
        textAlign: 'center',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        cursor: 'default',
      }}
    >
      <Link
        target="_window"
        href="https://github.com/ahdinosaur/play.gridbeam.xyz"
        sx={{
          padding: 1,
          color: 'primary',
          textDecoration: 'none',
          ':hover': { textDecoration: 'underline' },
        }}
      >
        play.gridbeam.xyz
      </Link>
      made with
      <span role="img" aria-label="heart" sx={{ padding: 1 }}>
        ❤️
      </span>
      by
      <Link
        href="https://dinosaur.is"
        target="_window"
        sx={{
          padding: 1,
          color: 'primary',
          textDecoration: 'none',
          ':hover': {
            textDecoration: 'underline',
          },
        }}
      >
        Mikey
      </Link>
    </Box>
  )
}

export default Layout

export function withLayout(PageComponent) {
  return function PageWithLayout(props) {
    return (
      <Layout>
        <PageComponent {...props} />
      </Layout>
    )
  }
}
