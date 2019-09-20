import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useStore } from 'react-redux'
import { values } from 'ramda'

export default Clipboard

function Clipboard (props) {
  const { select, dispatch } = useStore()

  const selectedParts = useSelector(select.parts.selected)

  const [clipboard, setClipboard] = useState()

  const cut = useCallback(() => {
    setClipboard(values(selectedParts))
    dispatch.parts.removeSelected()
  }, [selectedParts])
  const copy = useCallback(() => {
    setClipboard(values(selectedParts))
  }, [selectedParts])
  const paste = useCallback(() => {
    dispatch.parts.addParts(clipboard)
  }, [clipboard])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)

    function handleKey (ev) {
      if (ev.defaultPrevented) {
        return
      }

      if (ev.ctrlKey) {
        switch (ev.code) {
          case 'KeyX':
            return cut()
          case 'KeyC':
            return copy()
          case 'KeyV':
            return paste()
          default:
        }
      }
    }
  }, [cut, copy, paste])

  return null
}
