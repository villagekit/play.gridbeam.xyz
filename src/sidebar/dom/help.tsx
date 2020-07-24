/** @jsx jsx */
import React from 'react'
import { Box, Flex, jsx, Text } from 'theme-ui'

interface HelpProps {}

export function DomSidebarHelp(props: HelpProps) {
  return (
    <Flex sx={{ margin: 2, padding: 3, flexDirection: 'column' }}>
      <HelpHeading>Welcome to the Gridcraft sandbox!</HelpHeading>
      <HelpText>
        At the moment works best with a mouse and keyboard. Touchscreens are not
        yet supported.
      </HelpText>
      <HelpText>
        To select a single part, click on it. To select many parts, click and
        drag a selection box over the beams you want to select.
      </HelpText>
      <HelpText>
        To orbit the camera, either use the middle mouse to click and drag, or
        hold the Alt key then left click and drag. You can also click and drag
        from the planet icon on the right, or use the camera widget in the top
        right.
      </HelpText>
      <HelpText>
        To truck the camera, either use the right mouse to click and drag, or
        hold both the Alt key and the Shift key then left click and drag. You
        can also click and drag from the hand icon on the right.
      </HelpText>
      <HelpText>
        To zoom the camera, use your scroll wheel. You can also click and drag
        from the magnifying-glass icon on the right.
      </HelpText>

      <HelpText>
        To move a part, click and drag on a part (or on your selected part) to
        move horizontally. Press shift to move them around vertically.
      </HelpText>
      <HelpText>
        To scale a part, select the part, then click and drag the arrows on the
        ends to change the size.
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
