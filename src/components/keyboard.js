const React = require('react')
const { equals, prop } = require('ramda')
const modOp = require('mod-op')

// ideas:
// - be like, vim ("10u")
//
// commands:
//
// use frst to control view
// use unei to control objects

const useModelStore = require('../stores/model')

module.exports = Keyboard

function Keyboard (props) {
  const addPart = useModelStore(prop('addPart'))
  const updateSelected = useModelStore(prop('updateSelected'))
  const removeSelected = useModelStore(prop('removeSelected'))
  const selectedUuids = useModelStore(prop('selectedUuids'))

  const methods = {
    addPart,
    updateSelected,
    removeSelected
  }

  React.useEffect(
    () => {
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)

      function handleKey (ev) {
        if (ev.defaultPrevented) {
          return
        }

        const mode = 'rightHanded'
        var keyCode = ev.code
        if (ev.shiftKey) keyCode = `Shift_${keyCode}`
        const command = keyCodes[mode][keyCode]
        if (command == null) return
        const action = commands[command]
        if (action == null) return
        const [actionName, ...actionArgs] = action
        if (actionName.endsWith('Selected') && selectedUuids.length === 0) {
          return
        }
        const actionMethod = methods[actionName]

        actionMethod(...actionArgs)
      }
    },
    [selectedUuids, addPart, updateSelected, removeSelected]
  )

  return null
}

const commands = {
  moveForward: ['updateSelected', part => part.origin[0]++],
  moveBackward: ['updateSelected', part => part.origin[0]--],
  moveUp: ['updateSelected', part => part.origin[1]++],
  moveDown: ['updateSelected', part => part.origin[1]--],
  moveRight: ['updateSelected', part => part.origin[2]++],
  moveLeft: ['updateSelected', part => part.origin[2]--],
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

const keyCodes = {
  rightHanded: {
    KeyE: 'moveForward',
    ArrowUp: 'moveForward',
    Shift_KeyE: 'moveUp',
    Shift_ArrowUp: 'moveUp',
    KeyS: 'moveLeft',
    ArrowLeft: 'moveLeft',
    KeyD: 'moveBackward',
    ArrowDown: 'moveBackward',
    Shift_KeyD: 'moveDown',
    Shift_ArrowDown: 'moveDown',
    KeyF: 'moveRight',
    ArrowRight: 'moveRight',
    KeyW: 'rotatePrev',
    KeyR: 'rotateNext',
    KeyA: 'createBeam',
    KeyQ: 'removeSelected',
    KeyG: 'lengthenSelected',
    KeyT: 'unlengthenSelected'
  },
  leftHanded: {
    KeyI: 'moveForward',
    ArrowUp: 'moveForward',
    Shift_KeyI: 'moveUp',
    Shift_ArrowUp: 'moveUp',
    KeyJ: 'moveLeft',
    ArrowLeft: 'moveLeft',
    KeyK: 'moveBackward',
    ArrowDown: 'moveBackward',
    Shift_KeyK: 'moveDown',
    Shift_ArrowDown: 'moveDown',
    KeyL: 'moveRight',
    ArrowRight: 'moveRight',
    KeyU: 'rotatePrev',
    KeyO: 'rotateNext',
    Semicolon: 'createBeam',
    KeyP: 'removeSelected',
    KeyH: 'lengthenSelected',
    KeyY: 'unlengthenSelected'
  }
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
