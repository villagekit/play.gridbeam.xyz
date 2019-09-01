const React = require('react')
const { Box, Flex, Text, Button } = require('rebass/styled-components')
const Group = require('reakit/Group').default
const { default: styled } = require('styled-components')
const { set } = require('lodash')
const { mapObjIndexed, keys, pick, pipe, prop, values } = require('ramda')
const { useDebounce } = require('react-debounce-hook')

const useCameraStore = require('../stores/camera').default
const useModelStore = require('../stores/model')

const WIDGETS = [
  {
    id: 'parts',
    label: 'Parts',
    Content: Parts
  },
  {
    id: 'help',
    label: 'Help',
    Content: Help
  }
]

module.exports = Sidebar

function Parts (props) {
  const parts = useModelStore(prop('parts'))
  const selectedUuids = useModelStore(prop('selectedUuids'))
  const update = useModelStore(prop('update'))

  const selectedParts = React.useMemo(() => pick(keys(selectedUuids), parts), [
    parts,
    selectedUuids
  ])

  const renderPart = React.useMemo(() => {
    const renderBeam = (selected, uuid) => (
      <ControlSection key={uuid} title='beam'>
        <SelectControl
          name='direction'
          label='direction'
          options={['x', 'y', 'z']}
          value={selected.direction}
          update={next => update(uuid, next)}
        />
        <InputControl
          type='number'
          name='length'
          label='length'
          value={selected.length}
          min={1}
          update={next => update(uuid, next)}
        />
        <InputControl
          type='number'
          name='origin[0]'
          label='origin.x'
          value={selected.origin[0]}
          update={next => update(uuid, next)}
        />
        <InputControl
          type='number'
          name='origin[1]'
          label='origin.y'
          value={selected.origin[1]}
          update={next => update(uuid, next)}
        />
        <InputControl
          type='number'
          name='origin[2]'
          label='origin.z'
          value={selected.origin[2]}
          update={next => update(uuid, next)}
        />
      </ControlSection>
    )

    const renderers = {
      beam: renderBeam
    }

    return (selected, uuid) => {
      const renderer = renderers[selected.type]
      return renderer(selected, uuid)
    }
  }, [update])

  const renderSelectedParts = React.useMemo(() =>
    pipe(
      mapObjIndexed(renderPart),
      values
    )
  )

  return <>{renderSelectedParts(selectedParts)}</>
}

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

const ControlSection = props => {
  const { title, children } = props

  return (
    <Box p={3}>
      <Text fontSize={3}>{title}</Text>
      <Box as={Group}>{children}</Box>
    </Box>
  )
}

const InputControl = props => {
  const { name, label, value, update, ...inputProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback(value => {
    update(object => {
      set(object, name, Number(value))
    })
  }, [])
  const handleChange = React.useCallback(ev => {
    setValue(ev.target.value)
  }, [])

  useDebounce(nextValue, handleUpdate)

  return (
    <ControlContainer>
      <label name={name}>{label}</label>
      <input
        name={name}
        value={nextValue}
        onChange={handleChange}
        {...inputProps}
      />
    </ControlContainer>
  )
}

const SelectControl = props => {
  const { name, label, value, options, update, ...selectProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback(value => {
    update(object => {
      set(object, name, value)
    })
  }, [])
  const handleChange = React.useCallback(ev => {
    setValue(ev.target.value)
  }, [])

  useDebounce(nextValue, handleUpdate)

  return (
    <ControlContainer>
      <label name={name}>{label}</label>
      <select
        name={name}
        value={nextValue}
        onChange={handleChange}
        {...selectProps}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </ControlContainer>
  )
}

const ControlContainer = props => <Box {...props} />

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

function Help (props) {
  return 'help!'
}
