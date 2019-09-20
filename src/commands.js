import { useMemo } from 'react'
import { useSelector, useStore } from 'react-redux'
import { equals, map } from 'ramda'
import modOp from 'mod-op'

function useCommands () {
  const { select, dispatch } = useStore()

  const hasSelected = useSelector(select.parts.hasSelected)

  const methods = {
    addPart: dispatch.parts.addPart,
    updateSelected: dispatch.parts.updateSelected,
    removeSelected: dispatch.parts.removeSelected
  }

  const readyCommands = useMemo(() => {
    return map(([methodName, ...methodArgs]) => {
      const method = methods[methodName]
      if (method == null) return
      if (methodName.endsWith('Selected') && !hasSelected) {
        return () => {}
      }
      return () => method(...methodArgs)
    }, commands)
  }, [hasSelected])

  return readyCommands
}

export default useCommands

const commands = {
  moveForward: ['updateSelected', part => part.origin[0]++],
  moveBackward: ['updateSelected', part => part.origin[0]--],
  moveRight: ['updateSelected', part => part.origin[1]++],
  moveLeft: ['updateSelected', part => part.origin[1]--],
  moveUp: ['updateSelected', part => part.origin[2]++],
  moveDown: ['updateSelected', part => part.origin[2]--],
  rotateNext: rotateUpdater(index => ++index),
  rotatePrev: rotateUpdater(index => --index),
  createBeam: [
    'addPart',
    {
      type: 'beam',
      direction: 'x',
      length: 5,
      origin: [0, 0, 0]
    }
  ],
  removeSelected: ['removeSelected'],
  lengthenSelected: ['updateSelected', part => part.length++],
  unlengthenSelected: ['updateSelected', part => part.length--]
}

const directions = ['x', 'y', 'z']

function rotateUpdater (indexUpdater) {
  return [
    'updateSelected',
    part => {
      const currentDirectionIndex = directions.findIndex(equals(part.direction))
      const nextDirectionIndex = modOp(
        indexUpdater(currentDirectionIndex),
        directions.length
      )
      part.direction = directions[nextDirectionIndex]
    }
  ]
}
