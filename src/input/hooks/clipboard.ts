import { values } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  doAddParts,
  doRemoveSelectedParts,
  getSelectedParts,
  PartEntity,
} from 'src'

export const useClipboard = () => {
  const dispatch = useDispatch()

  const selectedParts = useSelector(getSelectedParts)

  const [clipboard, setClipboard] = useState<Array<PartEntity>>([])

  const cut = useCallback(() => {
    setClipboard(values(selectedParts))
    dispatch(doRemoveSelectedParts())
  }, [dispatch, selectedParts])

  const copy = useCallback(() => {
    setClipboard(values(selectedParts))
  }, [selectedParts])

  const paste = useCallback(() => {
    dispatch(doAddParts(clipboard))
  }, [clipboard, dispatch])

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
