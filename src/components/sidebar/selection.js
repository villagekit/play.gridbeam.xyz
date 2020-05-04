import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Flex, Label, Select, Slider, Text } from 'theme-ui'
import { map } from 'lodash'
import { useDebounce } from 'react-debounce-hook'

import { getSelectedParts, doUpdatePart } from '../../store'
import Codec from '../../codec'

export default Selection

function Selection(props) {
  const dispatch = useDispatch()

  const selectedParts = useSelector(getSelectedParts)

  const renderSelectedParts = React.useMemo(() => {
    const renderBeam = (uuid, selected) => (
      <ControlSection key={uuid} title="beam">
        {/*
        <SelectControl
          name='direction'
          label='direction'
          options={['x', 'y', 'z']}
          path={['direction']}
          value={selected.direction}
          update={updater => dispatch(doUpdateParts({ uuid, updater }))}
        />
        */}
        <SliderControl
          name="length"
          label="length"
          path={['length']}
          value={selected.length}
          min={1}
          update={(updater) => dispatch(doUpdatePart({ uuid, updater }))}
        />
        <SliderControl
          name="origin.x"
          label="origin.x"
          path={['origin', 'x']}
          value={selected.origin.x}
          update={(updater) => dispatch(doUpdatePart({ uuid, updater }))}
        />
        <SliderControl
          name="origin.y"
          label="origin.y"
          path={['origin', 'y']}
          value={selected.origin.y}
          update={(updater) => dispatch(doUpdatePart({ uuid, updater }))}
        />
        <SliderControl
          name="origin.z"
          label="origin.z"
          path={['origin', 'z']}
          value={selected.origin.z}
          update={(updater) => dispatch(doUpdatePart({ uuid, updater }))}
        />
      </ControlSection>
    )

    const renderers = {
      [Codec.PartType.Beam]: renderBeam,
    }

    return (selectedParts) =>
      map(selectedParts, (selectedPart) => {
        const renderer = renderers[selectedPart.type]
        const { uuid } = selectedPart
        return renderer(uuid, selectedPart)
      })
  }, [dispatch])

  return (
    <SelectionContainer>
      {renderSelectedParts(selectedParts)}
    </SelectionContainer>
  )
}

const SelectionContainer = (props) => (
  <Flex sx={{ flexDirection: 'column' }} {...props} />
)

const ControlSection = (props) => {
  const { title, children } = props

  return (
    <Box p={3}>
      <Text fontSize={3}>{title}</Text>
      <Box>{children}</Box>
    </Box>
  )
}

const SliderControl = (props) => {
  const { name, label, path, value, update, ...inputProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback(
    (value) => {
      update({
        update: 'set',
        path,
        value: Number(value),
      })
    },
    [path, update],
  )
  const handleChange = React.useCallback((ev) => {
    setValue(ev.target.value)
  }, [])

  useDebounce(nextValue, handleUpdate)

  return (
    <ControlContainer>
      <Label htmlFor={name}>{label}</Label>
      <Slider
        name={name}
        value={nextValue}
        onChange={handleChange}
        {...inputProps}
      />
    </ControlContainer>
  )
}

const SelectControl = (props) => {
  const { name, label, path, value, options, update, ...selectProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback(
    (value) => {
      update({
        update: 'set',
        path,
        value,
      })
    },
    [path, update],
  )
  const handleChange = React.useCallback((ev) => {
    setValue(ev.target.value)
  }, [])

  useDebounce(nextValue, handleUpdate)

  return (
    <ControlContainer>
      <label name={name}>{label}</label>
      <Select
        name={name}
        value={nextValue}
        onChange={handleChange}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </ControlContainer>
  )
}

const ControlContainer = (props) => <Box {...props} />
