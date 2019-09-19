const React = require('react')
const { useStore } = require('react-redux')
const { Box, Flex, Button } = require('rebass/styled-components')

const WIDGETS = [
  {
    id: 'selection',
    label: 'Selection',
    Content: require('./selection')
  },
  {
    id: 'parts',
    label: 'Parts',
    Content: require('./parts')
  },
  {
    id: 'share',
    label: 'Share',
    Content: require('./share')
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
      <ContentWrapper>
        <Content />
      </ContentWrapper>
      <CloseButton handleClose={handleClose} />
    </SidebarContainer>
  )
}

const SidebarContainer = props => {
  const { dispatch } = useStore()
  const handleMouseOver = React.useCallback(ev => {
    dispatch.camera.disableControl()
  }, [])
  const handleMouseOut = React.useCallback(ev => {
    dispatch.camera.enableControl()
  }, [])

  return (
    <Flex
      flexDirection='column'
      css={{
        width: '40em',
        userSelect: 'text',
        zIndex: 1
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    />
  )
}

const ContentWrapper = props => (
  <Box
    flex='1'
    css={{
      overflow: 'auto'
    }}
    {...props}
  />
)

const CloseButton = props => {
  const { handleClose } = props
  return (
    <Button
      onClick={handleClose}
      m={1}
      height={'2rem'}
      bg='darkcyan'
      flex='0 1 auto'
      css={{ zIndex: 1 }}
    >
      Close
    </Button>
  )
}

const OpenerButton = props => {
  const { label, handleOpen } = props
  return (
    <Button onClick={handleOpen} bg='darkcyan' m={1}>
      {label}
    </Button>
  )
}

const OpenersContainer = props => (
  <Flex
    flexDirection='column'
    css={{ position: 'absolute', right: 0, bottom: 0, zIndex: 1 }}
    {...props}
  />
)
