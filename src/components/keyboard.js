const React = require('react')

const useCommands = require('../commands')

// ideas:
// - be like, vim ("10u")
//
// commands:
//
// use frst to control view
// use unei to control objects

module.exports = Keyboard

function Keyboard (props) {
  const commands = useCommands()

  React.useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)

    function handleKey (ev) {
      if (ev.defaultPrevented) {
        return
      }

      const mode = 'rightHanded'
      var keyCode = ev.code
      if (ev.shiftKey) keyCode = `Shift_${keyCode}`
      const commandName = keyCodes[mode][keyCode]
      if (commandName == null) return
      const command = commands[commandName]
      if (command == null) return
      command()
    }
  }, [commands])

  return null
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
