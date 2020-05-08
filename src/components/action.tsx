import React from 'react'
import { useSelector } from 'react-redux'
import { getHasSelectedAnyParts } from 'src'
import { Button, Flex } from 'theme-ui'

import useCommands from '../commands'

interface Action {
  id: string
  label: string
  whenSelected: boolean
}

const ACTIONS: Array<Action> = [
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
    whenSelected: false,
  },
]

export default ActionButtons

interface ActionButtonsProps {}

function ActionButtons(props: ActionButtonsProps) {
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
        if (command == null) {
          throw new Error(`action ${action.id} has no command`)
        }
        return <ActionButton key={id} label={label} handleClick={command} />
      })}
    </ActionsContainer>
  )
}

interface ActionsContainerProps extends React.ComponentProps<typeof Flex> {}

const ActionsContainer = (props: ActionsContainerProps) => (
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

interface ActionButtonProps {
  label: string
  handleClick: () => void
}

const ActionButton = ({ label, handleClick }: ActionButtonProps) => (
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
