import React from 'react'
import { useSelector } from 'react-redux'
import { Button, Flex } from 'theme-ui'

import useCommands from '../commands'
import { getHasSelectedAnyParts } from '../store'

const ACTIONS = [
  {
    id: 'moveForward',
    label: 'Forward',
    whenSelected: true,
  },
  {
    id: 'moveBackward',
    label: 'Backward',
    whenSelected: true,
  },
  {
    id: 'moveUp',
    label: 'Up',
    whenSelected: true,
  },
  {
    id: 'moveDown',
    label: 'Down',
    whenSelected: true,
  },
  {
    id: 'moveRight',
    label: 'Right',
    whenSelected: true,
  },
  {
    id: 'moveLeft',
    label: 'Left',
    whenSelected: true,
  },
  {
    id: 'rotatePlusX',
    label: 'Rotate +X',
    whenSelected: true,
  },
  {
    id: 'rotatePlusY',
    label: 'Rotate +Y',
    whenSelected: true,
  },
  {
    id: 'rotatePlusZ',
    label: 'Rotate +Z',
    whenSelected: true,
  },
  {
    id: 'lengthenSelected',
    label: 'Lengthen',
    whenSelected: true,
  },
  {
    id: 'unlengthenSelected',
    label: 'Unlengthen',
    whenSelected: true,
  },
  {
    id: 'removeSelected',
    label: 'Delete',
    whenSelected: true,
  },
  {
    id: 'createBeam',
    label: 'Add',
  },
]

export default ActionButtons

function ActionButtons(props) {
  const hasSelected = useSelector(getHasSelectedAnyParts)

  const commands = useCommands()

  const possibleActions = React.useMemo(
    () =>
      ACTIONS.filter((action) => {
        return action.whenSelected === true ? hasSelected : true
      }),
    [hasSelected],
  )

  return (
    <ActionsContainer>
      {possibleActions.map((action) => {
        const { label, id } = action
        const command = commands[action.id]
        return <ActionButton key={id} label={label} handleClick={command} />
      })}
    </ActionsContainer>
  )
}

const ActionsContainer = (props) => (
  <Flex
    sx={{
      flexDirection: 'column',
      position: 'absolute',
      left: 0,
      bottom: 0,
    }}
    {...props}
  />
)

const ActionButton = ({ label, handleClick }) => (
  <Button
    sx={{
      backgroundColor: 'darkmagenta',
      margin: 1,
      zIndex: 1,
    }}
    onClick={handleClick}
  >
    {label}
  </Button>
)
