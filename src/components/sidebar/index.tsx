import React from 'react'
import { useDispatch } from 'react-redux'
import { Box, Button, Flex } from 'theme-ui'

import { doDisableCameraControl, doEnableCameraControl } from '../../store'
import HelpWidget from './help'
import PartsWidget from './parts'
import SelectionWidget from './selection'
import ShareWidget from './share'

interface Widget {
  id: string
  label: string
  Content: React.ReactType
}

const WIDGETS: Array<Widget> = [
  {
    id: 'selection',
    label: 'Selection',
    Content: SelectionWidget,
  },
  {
    id: 'parts',
    label: 'Parts',
    Content: PartsWidget,
  },
  {
    id: 'share',
    label: 'Share',
    Content: ShareWidget,
  },
  {
    id: 'help',
    label: 'Help',
    Content: HelpWidget,
  },
]

export default Sidebar

interface SidebarProps {}

function Sidebar(props: SidebarProps) {
  const [currentWidgetId, setCurrentWidgetId] = React.useState<
    Widget['id'] | null
  >(null)
  const handleClose = React.useCallback(() => setCurrentWidgetId(null), [])
  const currentWidget = React.useMemo(
    () => WIDGETS.find((widget) => widget.id === currentWidgetId),
    [currentWidgetId],
  )

  // if is open
  if (currentWidget == null) {
    return (
      <OpenersContainer>
        {WIDGETS.map((widget) => {
          const { id, label } = widget
          return (
            <OpenerButton
              key={id}
              label={label}
              handleOpen={() => setCurrentWidgetId(id)}
            />
          )
        })}
      </OpenersContainer>
    )
  }

  const { Content } = currentWidget

  return (
    <SidebarContainer>
      <ContentWrapper>
        <Content />
      </ContentWrapper>
      <CloseButton handleClose={handleClose} />
    </SidebarContainer>
  )
}

interface SidebarContainerProps extends React.ComponentProps<typeof Flex> {}

const SidebarContainer = (props: SidebarContainerProps) => {
  const dispatch = useDispatch()
  const handleMouseOver = React.useCallback(
    (ev) => {
      dispatch(doDisableCameraControl())
    },
    [dispatch],
  )
  const handleMouseOut = React.useCallback(
    (ev) => {
      dispatch(doEnableCameraControl())
    },
    [dispatch],
  )

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        width: '40em',
        userSelect: 'text',
        zIndex: 1,
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    />
  )
}

interface ContentWrapperProps extends React.ComponentProps<typeof Box> {}

const ContentWrapper = (props: ContentWrapperProps) => (
  <Box
    sx={{
      flex: '1',
      overflow: 'auto',
    }}
    {...props}
  />
)

interface CloseButtonProps {
  handleClose: (ev: React.MouseEvent<HTMLButtonElement>) => void
}

const CloseButton = (props: CloseButtonProps) => {
  const { handleClose } = props
  return (
    <Button
      onClick={handleClose}
      sx={{
        margin: 1,
        height: '32px',
        backgroundColor: 'darkcyan',
        flex: '0 1 auto',
        zIndex: 1,
      }}
    >
      Close
    </Button>
  )
}

interface OpenerButtonProps {
  label: string
  handleOpen: (ev: React.MouseEvent<HTMLButtonElement>) => void
}

const OpenerButton = (props: OpenerButtonProps) => {
  const { label, handleOpen } = props
  return (
    <Button
      onClick={handleOpen}
      sx={{ backgroundColor: 'darkcyan', margin: 1 }}
    >
      {label}
    </Button>
  )
}

interface OpenersContainerProps extends React.ComponentProps<typeof Flex> {}

const OpenersContainer = (props: OpenersContainerProps) => (
  <Flex
    sx={{
      flexDirection: 'column',
      position: 'absolute',
      right: 0,
      bottom: 0,
      zIndex: 1,
    }}
    {...props}
  />
)
