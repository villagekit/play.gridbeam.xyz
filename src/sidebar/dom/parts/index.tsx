import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { PartControls } from './controls'
import { PartSummary } from './summary'
import { PartTree } from './tree'

interface PartsProps {}

export function DomSidebarParts(props: PartsProps) {
  return (
    <Container>
      <Header />
      <PartSummary />
      <Box sx={{ flex: 1 }}>
        <PartTree />
      </Box>
      <Box sx={{ flex: 1 }}>
        <PartControls />
      </Box>
    </Container>
  )
}

interface ContainerProps extends React.ComponentProps<typeof Box> {}

const Container = (props: ContainerProps) => (
  <Flex sx={{ flexDirection: 'column', padding: 3 }} {...props} />
)

interface HeaderProps extends React.ComponentProps<typeof Text> {}

const Header = (props: HeaderProps) => (
  <Text as="h2" sx={{ fontSize: 4 }}>
    Parts
  </Text>
)
