const React = require('react')
const { Flex, Button } = require('rebass/styled-components')

const useCameraStore = require('../../stores/camera').default

const WIDGETS = [
  {
    id: 'parts',
    label: 'Parts',
    Content: require('./parts')
  },
  {
    id: 'help',
    label: 'Help',
    Content: require('./help')
  }
]

module.exports = Sidebar

function Sidebar (props) {
  const [currentWidgetId, setCurrentWidgetId] = React.useState(null)
  const handleClose = React.useCallback(() => setCurrentWidgetId(null), [])
  const currentWidget = React.useMemo(
    () => WIDGETS.find(widget => widget.id === currentWidgetId),
    [WIDGETS, currentWidgetId]
  )
  const isOpen = React.useMemo(() => currentWidget != null, [currentWidget])

  if (!isOpen) {
    return (
      <OpenersContainer>
        {WIDGETS.map(widget => {
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
      <Content />
      <CloseButton handleClose={handleClose} />
    </SidebarContainer>
  )
}

const SidebarContainer = props => {
  const enableCameraControl = useCameraStore(state => state.enableControl)
  const disableCameraControl = useCameraStore(state => state.disableControl)

  const handleMouseOver = React.useCallback(ev => {
    disableCameraControl()
  }, [])
  const handleMouseOut = React.useCallback(ev => {
    enableCameraControl()
  }, [])

  return (
    <Flex
      flexDirection='column'
      css={{
        width: '40em',
        userSelect: 'text'
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    />
  )
}

const CloseButton = props => {
  const { handleClose } = props
  return (
    <Button
      onClick={handleClose}
      bg='darkcyan'
      m={1}
      css={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 1
      }}
    >
      Close
    </Button>
  )
}

const OpenerButton = props => {
  const { label, handleOpen } = props
  return (
    <Button
      onClick={handleOpen}
      bg='darkcyan'
      m={1}
      css={{
        zIndex: 1
      }}
    >
      {label}
    </Button>
  )
}

const OpenersContainer = props => (
  <Flex
    flexDirection='column'
    css={{ position: 'absolute', right: 0, bottom: 0 }}
    {...props}
  />
)
