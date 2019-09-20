import React from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'

export default Help

function Help (props) {
  return (
    <Flex m={2} p={3} flexDirection='column'>
      <Text m={2} fontSize={2} fontFamily='heading'>
        Welcome to the GridBeam Playground!
      </Text>
      <Text m={2} fontFamily='body'>
        At the moment works best with a mouse and keyboard. Touchscreens are not
        yet supported.
      </Text>
      <Text m={2} fontFamily='body'>
        Left click and drag to orbit the camera. Right click and drag to pan the
        camera.
      </Text>
      <Text m={2} fontFamily='body'>
        To select a single beam, click on it. To select many beams, press shift,
        then click and drag a selection box over the beams you want to select.
      </Text>
      <Text m={2} fontFamily='body'>
        Click and drag on a beam (or on your selected beams) to move them around
        horizontally. Press shift to move them around vertically.
      </Text>
      <Box
        as='dl'
        m={3}
        fontSize={-1}
        fontFamily='body'
        css={{
          width: '100%',
          dt: {
            display: 'inline-block',
            width: '50%',
            paddingRight: '0.25rem',
            textAlign: 'right'
          },
          dd: {
            display: 'inline-block',
            width: '50%',
            paddingLeft: '0.25rem',
            textAlign: 'left'
          }
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
      <Text m={2} fontFamily='body'>
        If you enjoyed this, please send &nbsp;
        <a href='https://dinosaur.is' target='_window'>
          Mikey
        </a>
        &nbsp; a message!
      </Text>
    </Flex>
  )
}
