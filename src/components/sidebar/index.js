import React from 'react'
import { useDispatch } from 'react-redux'
import { Box, Flex, Button } from 'theme-ui'

import { doDisableCameraControl, doEnableCameraControl } from '../../store'
import SelectionWidget from './selection'
import PartsWidget from './parts'
import ShareWidget from './share'
import HelpWidget from './help'

const WIDGETS = [
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

function Sidebar(props) {
  const [currentWidgetId, setCurrentWidgetId] = React.useState(null)
  const handleClose = React.useCallback(() => setCurrentWidgetId(null), [])
  const currentWidget = React.useMemo(
    () => WIDGETS.find((widget) => widget.id === currentWidgetId),
    [currentWidgetId],
  )
  const isOpen = React.useMemo(() => currentWidget != null, [currentWidget])

  if (!isOpen) {
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

const SidebarContainer = (props) => {
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

const ContentWrapper = (props) => (
  <Box
    sx={{
      flex: '1',
      overflow: 'auto',
    }}
    {...props}
  />
)

const CloseButton = (props) => {
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

const OpenerButton = (props) => {
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

const OpenersContainer = (props) => (
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
