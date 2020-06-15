import { map } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useDebounce } from 'react-debounce-hook'
import { useDispatch, useSelector } from 'react-redux'
import {
  doUpdateParts,
  getSelectedParts,
  LengthDirection,
  PartType,
  PartUpdate,
  PartValue,
  Uuid,
} from 'src'
import { Box, Flex, Label, Select, Slider, Text } from 'theme-ui'

interface SelectionProps {}

export function DomSidebarSelection(props: SelectionProps) {
  const dispatch = useDispatch()

  const selectedParts = useSelector(getSelectedParts)

  const handleUpdate = useCallback(
    (update: PartUpdate) => dispatch(doUpdateParts(update)),
    [dispatch],
  )

  const renderSelectedParts = useMemo(() => {
    const renderBeam = (uuid: Uuid, value: PartValue) => {
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
            value={value.length}
            min={1}
            onUpdate={(nextValue) =>
              handleUpdate({
                type: 'scale',
                payload: {
                  uuids: [uuid],
                  delta: nextValue - value.length,
                  lengthDirection: LengthDirection.positive,
                },
              })
            }
          />
          <SliderControl
            name="origin.x"
            label="origin.x"
            value={value.origin.x}
            onUpdate={(nextValue) =>
              handleUpdate({
                type: 'move',
                payload: {
                  uuids: [uuid],
                  delta: [nextValue - value.origin.x, 0, 0],
                },
              })
            }
          />
          <SliderControl
            name="origin.y"
            label="origin.y"
            value={value.origin.y}
            onUpdate={(nextValue) =>
              handleUpdate({
                type: 'move',
                payload: {
                  uuids: [uuid],
                  delta: [0, nextValue - value.origin.y, 0],
                },
              })
            }
          />
          <SliderControl
            name="origin.z"
            label="origin.z"
            value={value.origin.z}
            onUpdate={(nextValue) =>
              handleUpdate({
                type: 'move',
                payload: {
                  uuids: [uuid],
                  delta: [0, 0, nextValue - value.origin.z],
                },
              })
            }
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
  value: T
  onUpdate: (value: T) => void
}

type SliderControlProps = ControlProps<number> &
  React.ComponentProps<typeof Slider>

const SliderControl = (props: SliderControlProps) => {
  const { name, label, value, onUpdate, ...inputProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback((value) => onUpdate(Number(value)), [
    onUpdate,
  ])
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
  const { name, label, value, options, onUpdate, ...selectProps } = props

  const [nextValue, setValue] = React.useState(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  const handleUpdate = React.useCallback((value) => onUpdate(value), [onUpdate])
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
