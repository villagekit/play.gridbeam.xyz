import React from 'react'

import useCommands from '../commands'

// ideas:
// - be like, vim ("10u")
//
// commands:
//
// use frst to control view
// use unei to control objects

export default Keyboard

function Keyboard(props) {
  const commands = useCommands()

  React.useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)

    function handleKey(ev) {
      if (ev.defaultPrevented) {
        return
      }

      const mode = 'rightHanded'
      let keyCode = ev.code
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
    KeyW: 'rotateNextInclination',
    Shift_KeyW: 'rotatePrevInclination',
    KeyR: 'rotateNextAzimuth',
    Shift_KeyR: 'rotatePrevAzimuth',
    KeyA: 'createBeam',
    KeyQ: 'removeSelected',
    KeyG: 'lengthenSelected',
    KeyT: 'unlengthenSelected',
    Backspace: 'removeSelected',
    Delete: 'removeSelected',
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
    KeyY: 'unlengthenSelected',
    Backspace: 'removeSelected',
    Delete: 'removeSelected',
  },
}
