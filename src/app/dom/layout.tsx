import 'typeface-bungee'
import 'typeface-ibm-plex-sans'
import 'typeface-ibm-plex-serif'

import { css, Global as GlobalStyle } from '@emotion/core'
import { shade } from '@theme-ui/color'
import reset from 'emotion-reset'
import React from 'react'
import { Box, Link } from 'theme-ui'

interface LayoutProps {
  children: React.ReactNode
}

export const DomLayout = ({ children }: LayoutProps) => (
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

interface MainProps extends React.ComponentProps<typeof Box> {}

function Main(props: MainProps) {
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

interface FooterProps {}

function Footer(props: FooterProps) {
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

export function withDomLayout(PageComponent: React.ComponentType) {
  return function PageWithLayout(
    props: React.ComponentProps<typeof PageComponent>,
  ) {
    return (
      <DomLayout>
        <PageComponent {...props} />
      </DomLayout>
    )
  }
}
