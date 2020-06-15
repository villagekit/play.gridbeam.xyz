import { useCallback, useEffect, useState } from 'react'
import { useClipboard } from 'src'

export function useClipboardInput() {
  const { cut, copy, paste } = useClipboard()

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)

    function handleKey(ev: KeyboardEvent) {
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
}
