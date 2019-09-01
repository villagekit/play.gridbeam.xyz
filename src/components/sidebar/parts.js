const React = require('react')
const { Box, Flex, Text } = require('rebass/styled-components')
const Group = require('reakit/Group').default
const { set } = require('lodash')
const { mapObjIndexed, keys, pick, pipe, prop, values } = require('ramda')
const { useDebounce } = require('react-debounce-hook')

const useModelStore = require('../../stores/model')

module.exports = Parts

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

  return <PartsContainer>{renderSelectedParts(selectedParts)}</PartsContainer>
}

const PartsContainer = props => <Flex flexDirection='column' {...props} />

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
