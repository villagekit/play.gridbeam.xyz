import { useEffect } from 'react'
import { useAppDispatch } from 'src'

import { doSetModifier, ModifierKey } from '../store'

export const useInputModifiers = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let ctrlDowns = 0
    let altDowns = 0
    let shiftDowns = 0

    let currentModifiers: Record<ModifierKey, boolean | null> = {
      ctrl: null,
      alt: null,
      shift: null,
    }

    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('blur', handleBlur)
    }

    function handleKeyUp(ev: KeyboardEvent) {
      if (ev.code === 'ControlLeft' || ev.code === 'ControlRight') ctrlDowns--
      else if (ev.code === 'AltLeft' || ev.code === 'AltRight') altDowns--
      else if (ev.code === 'ShiftLeft' || ev.code === 'ShiftRight') shiftDowns--

      updateModifiers()
    }

    function handleKeyDown(ev: KeyboardEvent) {
      console.log('down')
      if (ev.code === 'ControlLeft' || ev.code === 'ControlRight') ctrlDowns++
      else if (ev.code === 'AltLeft' || ev.code === 'AltRight') altDowns++
      else if (ev.code === 'ShiftLeft' || ev.code === 'ShiftRight') shiftDowns++

      updateModifiers()
    }

    function handleBlur() {
      ctrlDowns = 0
      altDowns = 0
      shiftDowns = 0

      updateModifiers()
    }

    function updateModifiers() {
      const nextModifiers: Record<ModifierKey, boolean> = {
        [ModifierKey.ctrl]: ctrlDowns > 0,
        [ModifierKey.alt]: altDowns > 0,
        [ModifierKey.shift]: shiftDowns > 0,
      }

      for (let modifierKey in nextModifiers) {
        const key = modifierKey as ModifierKey
        if (currentModifiers[key] !== nextModifiers[key]) {
          const value = nextModifiers[modifierKey as ModifierKey]
          dispatch(doSetModifier({ key, value }))
          currentModifiers[key] = value
        }
      }
    }
  }, [dispatch])
}
