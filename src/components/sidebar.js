const React = require('react')
const { Box, Flex, Text, Button } = require('rebass')
const Group = require('reakit/Group').default
const { default: styled } = require('styled-components')
const { set } = require('lodash')
const { mapObjIndexed, keys, pick, pipe, prop, values } = require('ramda')

const useCameraStore = require('../stores/camera').default
const useModelStore = require('../stores/model')

module.exports = Sidebar

function Sidebar (props) {
  const parts = useModelStore(prop('parts'))
  const selectedUuids = useModelStore(prop('selectedUuids'))
  const update = useModelStore(prop('update'))

  const selectedParts = React.useMemo(() => pick(keys(selectedUuids), parts), [
    parts,
    selectedUuids
  ])

  const [isOpen, setIsOpen] = React.useState(false)
  React.useEffect(
    () => {
      const nextIsOpen = Object.keys(selectedUuids).length > 0
      setIsOpen(nextIsOpen)
    },
    [selectedUuids]
  )
  const handleClose = React.useCallback(() => setIsOpen(false))

  const renderPart = React.useMemo(
    () => {
      const renderBeam = (selected, uuid) => (
        <ControlSection key={uuid} title='beam'>
          <SelectControl
            update={next => update(uuid, next)}
            name='direction'
            label='direction'
            options={['x', 'y', 'z']}
            defaultValue={selected.direction}
          />
          <InputControl
            update={next => update(uuid, next)}
            min={1}
            name='length'
            label='length'
            defaultValue={selected.length}
            type='number'
          />
          <InputControl
            update={next => update(uuid, next)}
            name='origin[0]'
            label='origin.x'
            defaultValue={selected.origin[0]}
            type='number'
          />
          <InputControl
            update={next => update(uuid, next)}
            name='origin[1]'
            label='origin.y'
            defaultValue={selected.origin[1]}
            type='number'
          />
          <InputControl
            update={next => update(uuid, next)}
            name='origin[2]'
            label='origin.z'
            defaultValue={selected.origin[2]}
            type='number'
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
    },
    [update]
  )

  const renderSelectedParts = React.useMemo(() =>
    pipe(mapObjIndexed(renderPart), values)
  )

  if (!isOpen) return null

  return (
    <SidebarContainer>
      <CloseButton handleClose={handleClose} />
      {renderSelectedParts(selectedParts)}
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
      css={{ width: '40em' }}
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
  const { name, label, update, ...inputProps } = props

  const handleChange = React.useCallback(ev => {
    update(object => {
      set(object, name, Number(ev.target.value))
    })
  }, [])

  return (
    <ControlContainer>
      <label name={name}>{label}</label>
      <input name={name} onBlur={handleChange} {...inputProps} />
    </ControlContainer>
  )
}

const SelectControl = props => {
  const { name, label, options, update, ...selectProps } = props

  const handleChange = React.useCallback(ev => {
    update(object => {
      set(object, name, ev.target.value)
    })
  }, [])

  return (
    <ControlContainer>
      <label name={name}>{label}</label>
      <select name={name} onBlur={handleChange} {...selectProps}>
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
    <Button onClick={handleClose} bg='green'>
      Close
    </Button>
  )
}
