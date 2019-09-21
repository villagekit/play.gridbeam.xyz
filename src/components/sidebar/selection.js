import React from 'react'
import { useSelector, useStore } from 'react-redux'
import { Box, Flex, Text } from 'rebass/styled-components'
import { Group } from 'reakit/Group'
import { map } from 'ramda'
import setIn from 'set-in'
import { useDebounce } from 'react-debounce-hook'

export default Selection

function Selection (props) {
  const { select, dispatch } = useStore()

  const selectedParts = useSelector(select.parts.selected)

  const renderSelectedParts = React.useMemo(() => {
    const renderBeam = (uuid, selected) => (
      <ControlSection key={uuid} title='beam'>
        <SelectControl
          name='direction'
          label='direction'
          options={['x', 'y', 'z']}
          path={['direction']}
          value={selected.direction}
          update={updater => dispatch.parts.update({ uuid, updater })}
        />
        <InputControl
          type='number'
          name='length'
          label='length'
          path={['length']}
          value={selected.length}
          min={1}
          update={updater => dispatch.parts.update({ uuid, updater })}
        />
        <InputControl
          type='number'
          name='origin.x'
          label='origin.x'
          path={['origin', 'x']}
          value={selected.origin.x}
          update={updater => dispatch.parts.update({ uuid, updater })}
        />
        <InputControl
          type='number'
          name='origin.y'
          label='origin.y'
          path={['origin', 'y']}
          value={selected.origin.y}
          update={updater => dispatch.parts.update({ uuid, updater })}
        />
        <InputControl
          type='number'
          name='origin.z'
          label='origin.z'
          path={['origin', 'z']}
          value={selected.origin.z}
          update={updater => dispatch.parts.update({ uuid, updater })}
        />
      </ControlSection>
    )

    const renderers = {
      beam: renderBeam
    }

    return map(selected => {
      const renderer = renderers[selected.type]
      const { uuid } = selected
      return renderer(uuid, selected)
    })
  }, [])

  return (
    <SelectionContainer>
      {renderSelectedParts(selectedParts)}
    </SelectionContainer>
  )
}

const SelectionContainer = props => <Flex flexDirection='column' {...props} />

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
  const { name, label, path, value, update, ...inputProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback(value => {
    update(object => {
      setIn(object, path, Number(value))
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
  const { name, label, path, value, options, update, ...selectProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback(value => {
    update(object => {
      setIn(object, path, value)
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
