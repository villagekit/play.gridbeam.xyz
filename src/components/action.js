const React = require('react')
const { Flex, Button } = require('rebass/styled-components')
const { keys, prop } = require('ramda')

const useModelStore = require('../stores/model')
const useCommands = require('../commands')

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
    id: 'rotateNext',
    label: 'Rotate',
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

module.exports = ActionButtons

function ActionButtons (props) {
  const selectedUuids = useModelStore(prop('selectedUuids'))

  const commands = useCommands()

  const hasSelected = React.useMemo(() => keys(selectedUuids).length > 0, [
    selectedUuids
  ])
  const possibleActions = React.useMemo(
    () =>
      ACTIONS.filter(action => {
        console.log('action', action, hasSelected)
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
