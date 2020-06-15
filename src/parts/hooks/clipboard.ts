import { keys, values } from 'lodash'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  doSetPartsClipboard,
  doUpdateParts,
  getPartsClipboard,
  getSelectedPartsEntities,
} from 'src'

export const useClipboard = () => {
  const dispatch = useDispatch()

  const selectedParts = useSelector(getSelectedPartsEntities)
  const clipboard = useSelector(getPartsClipboard)

  const cut = useCallback(() => {
    dispatch(doSetPartsClipboard(values(selectedParts)))
    dispatch(
      doUpdateParts({
        type: 'delete',
        payload: {
          uuids: keys(selectedParts),
        },
      }),
    )
  }, [dispatch, selectedParts])

  const copy = useCallback(() => {
    dispatch(doSetPartsClipboard(values(selectedParts)))
  }, [dispatch, selectedParts])

  const paste = useCallback(() => {
    dispatch(
      doUpdateParts({
        type: 'create',
        payload: {
          parts: clipboard,
        },
      }),
    )
  }, [clipboard, dispatch])

  return { cut, copy, paste }
}
