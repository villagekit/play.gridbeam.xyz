const { useMemo } = require('react')
const { equals, prop, map } = require('ramda')
const modOp = require('mod-op')

const useModelStore = require('./stores/model')

function useCommands () {
  const addPart = useModelStore(prop('addPart'))
  const updateSelected = useModelStore(prop('updateSelected'))
  const removeSelected = useModelStore(prop('removeSelected'))
  const selectedUuids = useModelStore(prop('selectedUuids'))

  const methods = {
    addPart,
    updateSelected,
    removeSelected
  }

  const readyCommands = useMemo(() => {
    return map(([methodName, ...methodArgs]) => {
      if (methodName.endsWith('Selected') && selectedUuids.length === 0) {
        return
      }
      const method = methods[methodName]
      if (method == null) return
      return () => method(...methodArgs)
    }, commands)
  }, [selectedUuids, addPart, updateSelected, removeSelected])

  return readyCommands
}

module.exports = useCommands

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
