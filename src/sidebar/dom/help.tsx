import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

interface HelpProps {}

export function DomSidebarHelp(props: HelpProps) {
  return (
    <Flex sx={{ margin: 2, padding: 3, flexDirection: 'column' }}>
      <HelpHeading>Welcome to the GridBeam Playground!</HelpHeading>
      <HelpText>
        At the moment works best with a mouse and keyboard. Touchscreens are not
        yet supported.
      </HelpText>
      <HelpText>
        To select a single beam, click on it. To select many beams, click and
        drag a selection box over the beams you want to select.
      </HelpText>
      <HelpText>
        To rotate the camera, hold the Alt key, then left click and drag. To
        truck the camera, hold both the Alt key and the Shift key, then left
        click and drag.
      </HelpText>
      <HelpText>
        Click and drag on a beam (or on your selected beams) to move them around
        horizontally. Press shift to move them around vertically.
      </HelpText>
      <HelpText>
        The figure in the scene is a scale reference aimed to be roughly 170 cm
        or ~5' 7''.
      </HelpText>
      <Box
        as="dl"
        sx={{
          margin: 3,
          fontSize: 1,
          fontFamily: 'body',
          width: '100%',
          dt: {
            display: 'inline-block',
            width: '50%',
            paddingRight: 1,
            textAlign: 'right',
          },
          dd: {
            display: 'inline-block',
            width: '50%',
            paddingLeft: 1,
            textAlign: 'left',
          },
        }}
      >
        <dt>E or Up</dt>
        <dd>forward</dd>
        <dt>D or Down</dt>
        <dd>backward</dd>
        <dt>S or Left</dt>
        <dd>left</dd>
        <dt>F or Right</dt>
        <dd>right</dd>
        <dt>Shift+E or Shift+Up</dt>
        <dd>up</dd>
        <dt>Shift+D or Shift+Down</dt>
        <dd>down</dd>
        <dt>W</dt>
        <dd>rotate next</dd>
        <dt>R</dt>
        <dd>rotate prev</dd>
        <dt>A</dt>
        <dd>add</dd>
        <dt>Q or Backspace or Delete</dt>
        <dd>delete</dd>
        <dt>G</dt>
        <dd>lengthen</dd>
        <dt>T</dt>
        <dd>unlengthen</dd>
        <dt>Ctrl+X</dt>
        <dd>cut</dd>
        <dt>Ctrl+C</dt>
        <dd>copy</dd>
        <dt>Ctrl+V</dt>
        <dd>paste</dd>
      </Box>
      <HelpText>
        If you enjoyed this, please send &nbsp;
        <a href="https://dinosaur.is" target="_window">
          Mikey
        </a>
        &nbsp; a message!
      </HelpText>
    </Flex>
  )
}

interface HelpHeadingProps extends React.ComponentProps<typeof Text> {}

const HelpHeading = (props: HelpHeadingProps) => (
  <Text sx={{ margin: 2, fontSize: 3, fontFamily: 'heading' }} {...props} />
)

interface HelpTextProps extends React.ComponentProps<typeof Text> {}

const HelpText = (props: HelpTextProps) => (
  <Text sx={{ margin: 2, fontSize: 2, fontFamily: 'body' }} {...props} />
)
