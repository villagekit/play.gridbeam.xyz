import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-debounce-hook'
import { useDispatch, useSelector } from 'react-redux'
import {
  doUpdateParts,
  getPartsByUuid,
  getSelectedUuids,
  LengthDirection,
  PartType,
  PartUpdate,
  PartValue,
  Uuid,
} from 'src'
import { Box, Input, Label, Select, Text } from 'theme-ui'

interface PartControlsProps {}

export function PartControls(props: PartControlsProps) {
  const [controlledPartUuid, setControlledPartUuid] = useState<null | Uuid>(
    null,
  )

  const selectedUuids = useSelector(getSelectedUuids)
  useEffect(() => {
    if (selectedUuids.length > 0) {
      if (controlledPartUuid == null) {
        setControlledPartUuid(selectedUuids[0])
      }
    } else {
      if (controlledPartUuid != null) {
        setControlledPartUuid(null)
      }
    }
  }, [controlledPartUuid, selectedUuids, setControlledPartUuid])

  const partsByUuid = useSelector(getPartsByUuid)
  const controlledPart = useMemo<null | PartValue>(() => {
    if (controlledPartUuid == null) return null
    // @ts-ignore
    return partsByUuid[controlledPartUuid] as PartValue
  }, [partsByUuid, controlledPartUuid])

  if (controlledPart == null) return null

  return (
    <Box as="section" sx={{ padding: 3 }}>
      <Box as="header" sx={{ paddingY: 2 }}>
        <Text as="h3" sx={{ fontSize: 3 }}>
          Controls
        </Text>
      </Box>
      <PartControl part={controlledPart} />
    </Box>
  )
}

interface PartControlProps {
  part: PartValue
}

function PartControl(props: PartControlProps) {
  const { part } = props

  const dispatch = useDispatch()
  const handleUpdate = useCallback(
    (update: PartUpdate) => dispatch(doUpdateParts(update)),
    [dispatch],
  )

  switch (part.type) {
    case PartType.Beam:
      return <BeamControl part={part} handleUpdate={handleUpdate} />
    case PartType.Skin:
      return null
    case PartType.Fastener:
      return null
    case PartType.Accessory:
      return null
    case PartType.Adapter:
      return null
  }
}

interface BeamControlProps {
  part: PartValue
  handleUpdate: (update: PartUpdate) => void
}

function BeamControl(props: BeamControlProps) {
  const { part: beam, handleUpdate } = props
  const { uuid, shortId } = beam

  return (
    <ControlSection title={shortId}>
      {/*
      <SelectControl
        name='direction'
        label='direction'
        options={['x', 'y', 'z']}
        path={['direction']}
        beam={selected.direction}
        update={updater => dispatch(doUpdateParts({ uuid, updater }))}
      />
      */}
      <NumberControl
        name="length"
        label="length"
        value={beam.length}
        min={1}
        max={200}
        onUpdate={(nextValue) =>
          handleUpdate({
            type: 'scale',
            payload: {
              uuids: [uuid],
              delta: nextValue - beam.length,
              lengthDirection: LengthDirection.positive,
            },
          })
        }
      />
      <NumberControl
        name="origin.x"
        label="origin.x"
        value={beam.origin.x}
        onUpdate={(nextValue) =>
          handleUpdate({
            type: 'move',
            payload: {
              uuids: [uuid],
              delta: [nextValue - beam.origin.x, 0, 0],
            },
          })
        }
      />
      <NumberControl
        name="origin.y"
        label="origin.y"
        value={beam.origin.y}
        onUpdate={(nextValue) =>
          handleUpdate({
            type: 'move',
            payload: {
              uuids: [uuid],
              delta: [0, nextValue - beam.origin.y, 0],
            },
          })
        }
      />
      <NumberControl
        name="origin.z"
        label="origin.z"
        value={beam.origin.z}
        onUpdate={(nextValue) =>
          handleUpdate({
            type: 'move',
            payload: {
              uuids: [uuid],
              delta: [0, 0, nextValue - beam.origin.z],
            },
          })
        }
      />
    </ControlSection>
  )
}

interface ControlSectionProps {
  title: string
  children: React.ReactNode
}

const ControlSection = (props: ControlSectionProps) => {
  const { title, children } = props

  return (
    <Box>
      <Text sx={{ fontSize: 4, paddingY: 3 }}>{title}</Text>
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

type NumberControlProps = ControlProps<number> &
  React.ComponentProps<typeof Input>

const NumberControl = (props: NumberControlProps) => {
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
      <Input
        type="number"
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
