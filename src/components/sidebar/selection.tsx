import { map } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useDebounce } from 'react-debounce-hook'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Flex, Label, Select, Slider, Text } from 'theme-ui'

import { UpdateDescriptor } from '../../helpers/updater'
import {
  doUpdatePart,
  getSelectedParts,
  PartType,
  PartValue,
  Uuid,
} from '../../store'

export default Selection

interface SelectionProps {}

function Selection(props: SelectionProps) {
  const dispatch = useDispatch()

  const selectedParts = useSelector(getSelectedParts)

  const handleUpdate = useCallback(
    (uuid: Uuid) => (updater: UpdateDescriptor) =>
      dispatch(doUpdatePart({ uuid, updater })),
    [dispatch],
  )

  const renderSelectedParts = useMemo(() => {
    const renderBeam = (uuid: Uuid, selected: PartValue) => {
      const handleBeamUpdate = handleUpdate(uuid)

      return (
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
            update={handleBeamUpdate}
          />
          <SliderControl
            name="origin.x"
            label="origin.x"
            path={['origin', 'x']}
            value={selected.origin.x}
            update={handleBeamUpdate}
          />
          <SliderControl
            name="origin.y"
            label="origin.y"
            path={['origin', 'y']}
            value={selected.origin.y}
            update={handleBeamUpdate}
          />
          <SliderControl
            name="origin.z"
            label="origin.z"
            path={['origin', 'z']}
            value={selected.origin.z}
            update={handleBeamUpdate}
          />
        </ControlSection>
      )
    }

    const renderers = {
      [PartType.Beam]: renderBeam,
      [PartType.Skin]: () => null,
      [PartType.Fastener]: () => null,
      [PartType.Accessory]: () => null,
      [PartType.Adapter]: () => null,
    }

    return (selectedParts: Array<PartValue>) =>
      map(selectedParts, (selectedPart) => {
        if (!(selectedPart.type in renderers)) return null
        const renderer = renderers[selectedPart.type]
        const { uuid } = selectedPart
        return renderer(uuid, selectedPart)
      })
  }, [handleUpdate])

  return (
    <SelectionContainer>
      {renderSelectedParts(selectedParts)}
    </SelectionContainer>
  )
}

interface SelectionContainerProps extends React.ComponentProps<typeof Flex> {}

const SelectionContainer = (props: SelectionContainerProps) => (
  <Flex sx={{ flexDirection: 'column' }} {...props} />
)

interface ControlSectionProps {
  title: string
  children: React.ReactNode
}

const ControlSection = (props: ControlSectionProps) => {
  const { title, children } = props

  return (
    <Box p={3}>
      <Text sx={{ fontSize: 3 }}>{title}</Text>
      <Box>{children}</Box>
    </Box>
  )
}

interface ControlProps<T> {
  name: string
  label: string
  path: string | Array<string>
  value: T
  update: (updateDescriptor: UpdateDescriptor) => void
}

type SliderControlProps = ControlProps<number> &
  React.ComponentProps<typeof Slider>

const SliderControl = (props: SliderControlProps) => {
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

type SelectControlProps<T> = ControlProps<T> &
  React.ComponentProps<typeof Select> & {
    options: Array<string>
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SelectControl<T>(props: SelectControlProps<T>) {
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
      <Label htmlFor={name}>{label}</Label>
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

interface ControlContainerProps extends React.ComponentProps<typeof Box> {}
const ControlContainer = (props: ControlContainerProps) => <Box {...props} />