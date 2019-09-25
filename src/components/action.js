import React from 'react'
import { useSelector, useStore } from 'react-redux'
import { Flex, Button } from 'rebass/styled-components'
import useCommands from '../commands'

const ACTIONS = [
  {
    id: 'moveForward',
    label: 'Forward',
    whenSelected: true
  },
  {
    id: 'moveBackward',
    label: 'Backward',
    whenSelected: true
  },
  {
    id: 'moveUp',
    label: 'Up',
    whenSelected: true
  },
  {
    id: 'moveDown',
    label: 'Down',
    whenSelected: true
  },
  {
    id: 'moveRight',
    label: 'Right',
    whenSelected: true
  },
  {
    id: 'moveLeft',
    label: 'Left',
    whenSelected: true
  },
  {
    id: 'rotatePlusX',
    label: 'Rotate +X',
    whenSelected: true
  },
  {
    id: 'rotatePlusY',
    label: 'Rotate +Y',
    whenSelected: true
  },
  {
    id: 'rotatePlusZ',
    label: 'Rotate +Z',
    whenSelected: true
  },
  {
    id: 'lengthenSelected',
    label: 'Lengthen',
    whenSelected: true
  },
  {
    id: 'unlengthenSelected',
    label: 'Unlengthen',
    whenSelected: true
  },
  {
    id: 'removeSelected',
    label: 'Delete',
    whenSelected: true
  },
  {
    id: 'createBeam',
    label: 'Add'
  }
]

export default ActionButtons

function ActionButtons (props) {
  const { select } = useStore()

  const hasSelected = useSelector(select.parts.hasSelected)

  const commands = useCommands()

  const possibleActions = React.useMemo(
    () =>
      ACTIONS.filter(action => {
        return action.whenSelected === true ? hasSelected : true
      }),
    [hasSelected]
  )

  return (
    <ActionsContainer>
      {possibleActions.map(action => {
        const { label, id } = action
        const command = commands[action.id]
        return <ActionButton key={id} label={label} handleClick={command} />
      })}
    </ActionsContainer>
  )
}

const ActionsContainer = props => (
  <Flex
    flexDirection='column'
    css={{ position: 'absolute', left: 0, bottom: 0 }}
    {...props}
  />
)

const ActionButton = ({ label, handleClick }) => (
  <Button
    bg='darkmagenta'
    m={1}
    css={{
      zIndex: 1
    }}
    onClick={handleClick}
  >
    {label}
  </Button>
)
