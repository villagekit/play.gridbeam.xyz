/** @jsx jsx */
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { doSelectParts, getParts, PartValue } from 'src'
import { Box, Button, Flex, jsx, Text } from 'theme-ui'

interface PartTreeProps {}

export function PartTree(props: PartTreeProps) {
  const parts = useSelector(getParts)

  return (
    <Box as="section" sx={{ padding: 3 }}>
      <Box as="header" sx={{ paddingY: 2 }}>
        <Text as="h3" sx={{ fontSize: 3 }}>
          Tree
        </Text>
      </Box>
      <PartTreeList parts={parts} />
    </Box>
  )
}

interface PartTreeListProps {
  parts: Array<PartValue>
}

function PartTreeList(props: PartTreeListProps) {
  const { parts } = props

  return (
    <List>
      {parts.map((part) => (
        <PartTreeItem key={part.uuid} part={part} />
      ))}
    </List>
  )
}

interface PartTreeItemProps {
  part: PartValue
}

export function PartTreeItem(props: PartTreeItemProps) {
  const { part } = props
  const { name, shortId } = part

  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(doSelectParts([part.uuid]))
  }, [dispatch, part.uuid])

  return (
    <ListItem
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        backgroundColor: part.isSelected ? 'yellow' : 'default',
      }}
    >
      <Button onClick={handleClick}>O</Button>
      <Text as="h4" sx={{ fontSize: 3, display: 'inline-block' }}>
        {shortId}
      </Text>
      <Text as="p" sx={{ fontSize: 2, display: 'inline-block' }}>
        {name}
      </Text>
    </ListItem>
  )
}

interface ListProps extends React.ComponentProps<typeof Flex> {}

const List = (props: ListProps) => (
  <Flex as="ul" sx={{ flexDirection: 'column' }} {...props} />
)

interface ListItemProps extends React.ComponentProps<typeof Box> {}

const ListItem = (props: ListItemProps) => (
  <Box as="li" sx={{ padding: 2 }} {...props} />
)
