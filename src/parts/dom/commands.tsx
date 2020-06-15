import React, { useCallback } from 'react'
import { Command, useCommands } from 'src'
import { Button, Flex } from 'theme-ui'

interface CommandButtonsProps {}

export function DomCommandButtons(props: CommandButtonsProps) {
  const commands = useCommands()

  return (
    <CommandsContainer>
      {commands.map((command) => {
        return <CommandButton key={command.id} command={command} />
      })}
    </CommandsContainer>
  )
}

interface CommandsContainerProps extends React.ComponentProps<typeof Flex> {}

const CommandsContainer = (props: CommandsContainerProps) => (
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

interface CommandButtonProps {
  command: Command
}

const CommandButton = (props: CommandButtonProps) => {
  const { command } = props
  const { label, action } = command

  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault()
      action()
    },
    [action],
  )

  return (
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
}
